import neo4j, { Driver, Session } from 'neo4j-driver';

class Neo4jService {
  private driver: Driver | null = null;

  constructor() {
    this.initializeDriver();
  }

  private initializeDriver() {
    try {
      const uri = import.meta.env.VITE_NEO4J_URI;
      const user = import.meta.env.VITE_NEO4J_USER;
      const password = import.meta.env.VITE_NEO4J_PASSWORD;

      if (!uri || !user || !password) {
        console.error('Neo4j connection information is missing');
        return;
      }

      this.driver = neo4j.driver(
        uri,
        neo4j.auth.basic(user, password),
        {
          maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 30000 // 30 seconds
        }
      );
    } catch (error) {
      console.error('Failed to create Neo4j driver:', error);
    }
  }

  async getBookKnowledgeGraph(bookTitle: string) {
    if (!this.driver) {
      throw new Error('Neo4j driver is not initialized');
    }

    const session: Session = this.driver.session();
    try {
      const result = await session.run(`
        MATCH (book:Book {title: $bookTitle})
        MATCH (n)-[r]-(m)
        WHERE (n)-[:APPEARS_IN]->(book) OR (m)-[:APPEARS_IN]->(book)
        RETURN DISTINCT n, r, m
      `, { bookTitle });

      const nodes = new Map();
      const links: any[] = [];

      result.records.forEach(record => {
        const source = record.get('n');
        const target = record.get('m');
        const relationship = record.get('r');

        if (!nodes.has(source.elementId)) {
          nodes.set(source.elementId, {
            id: source.elementId,
            name: source.properties.name || source.properties.title,
            type: source.labels[0],
            ...source.properties
          });
        }
        if (!nodes.has(target.elementId)) {
          nodes.set(target.elementId, {
            id: target.elementId,
            name: target.properties.name || target.properties.title,
            type: target.labels[0],
            ...target.properties
          });
        }

        links.push({
          source: source.elementId,
          target: target.elementId,
          type: relationship.type,
          ...relationship.properties
        });
      });

      return {
        nodes: Array.from(nodes.values()),
        links
      };
    } catch (error) {
      console.error('Neo4j query failed:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async getAvailableBooks() {
    if (!this.driver) {
      throw new Error('Neo4j driver is not initialized');
    }

    const session: Session = this.driver.session();
    try {
      const result = await session.run(`
        MATCH (b:Book)
        RETURN b.title as title, b.era as era
        ORDER BY b.era
      `);

      return result.records.map(record => ({
        title: record.get('title'),
        era: record.get('era')
      }));
    } catch (error) {
      console.error('Failed to fetch books:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async close() {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
    }
  }
}

export default new Neo4jService();