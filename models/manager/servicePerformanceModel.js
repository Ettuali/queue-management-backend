const db = require('../../config/db');

const getServicePerformance = async () => {
  const [rows] = await db.query(`
    SELECT 
      services.name AS service,
      COUNT(tickets.id) AS totalTickets,
      AVG(TIMESTAMPDIFF(SECOND, started_at, completed_at)) AS avgServiceTime
    FROM tickets
    JOIN services ON tickets.service_id = services.id
    GROUP BY services.id
  `);

  return rows.map(row => ({
  service: row.service,
  totalTickets: Number(row.totalTickets),
  avgServiceTime: Math.round(row.avgServiceTime)
}));

};

module.exports = { getServicePerformance };
