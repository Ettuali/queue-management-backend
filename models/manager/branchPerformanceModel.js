const db = require('../../config/db');

const getBranchPerformance = async () => {
const [rows] = await db.query(`
  SELECT 
    locations.name AS branch,
    COUNT(tickets.id) AS totalTickets,
    SUM(tickets.status = 'COMPLETED') AS completedTickets,
    AVG(TIMESTAMPDIFF(SECOND, started_at, completed_at)) AS avgServiceTime
  FROM tickets
  JOIN locations ON tickets.location_id = locations.id
  GROUP BY locations.id
`);


return rows.map(row => ({
  branch: row.branch,
  totalTickets: Number(row.totalTickets),
  completedTickets: Number(row.completedTickets),
  avgServiceTime: Math.round(row.avgServiceTime )
}));


};

module.exports = { getBranchPerformance };
