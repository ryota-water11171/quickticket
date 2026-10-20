const pool = require("./db");

async function getEventById(eventId) {
  const result = await pool.query(
    `
    SELECT
      e.id,
      e.title,
      e.description,
      e.genre,
      o.name AS organizer_name,
      p.id AS performance_id,
      p.starts_at,
      p.doors_open_at,
      p.seating_type,
      v.name AS venue_name,
      v.prefecture,
      v.city,
      v.address
    FROM events e
    JOIN organizers o ON o.id = e.organizer_id
    JOIN performances p ON p.event_id = e.id
    JOIN venues v ON v.id = p.venue_id
    WHERE e.id = $1
      AND e.status = 'published'
    ORDER BY p.starts_at
    LIMIT 1
    `,
    [eventId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const event = result.rows[0];

  const ticketsResult = await pool.query(
    `
    SELECT id, name, price_yen, capacity
    FROM ticket_types
    WHERE performance_id = $1
    ORDER BY price_yen, id
    `,
    [event.performance_id]
  );

  return {
    ...event,
    ticket_types: ticketsResult.rows,
  };
}

module.exports = { getEventById };
