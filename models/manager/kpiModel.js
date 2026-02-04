const db = require('../../config/db');

const getKPIs = async (locationId) => {
  // 🔍 Optional debug (safe)
  const [[dbInfo]] = await db.query(`SELECT DATABASE() AS db`);
  console.log("CONNECTED DB:", dbInfo.db, " | locationId:", locationId);

  const whereClause = locationId ? 'WHERE location_id = ?' : '';
  const params = locationId ? [locationId] : [];

  const [[totals]] = await db.query(`
    SELECT 
      COUNT(*) AS totalTickets,
      SUM(status = 'COMPLETED') AS completedTickets
    FROM tickets
    ${whereClause}
  `, params);

  const [[avgWait]] = await db.query(`
    SELECT 
      AVG(TIMESTAMPDIFF(SECOND, created_at, called_at)) AS avgWaitTime
    FROM tickets
    WHERE called_at IS NOT NULL
    ${locationId ? 'AND location_id = ?' : ''}
  `, params);

  const [[avgService]] = await db.query(`
    SELECT 
      AVG(TIMESTAMPDIFF(SECOND, started_at, completed_at)) AS avgServiceTime
    FROM tickets
    WHERE completed_at IS NOT NULL
    ${locationId ? 'AND location_id = ?' : ''}
  `, params);

  return {
    totalTickets: Number(totals.totalTickets || 0),
    completedTickets: Number(totals.completedTickets || 0),
    avgWaitTime: Math.round(avgWait.avgWaitTime || 0),
    avgServiceTime: Math.round(avgService.avgServiceTime || 0)
  };
};

module.exports = { getKPIs };
