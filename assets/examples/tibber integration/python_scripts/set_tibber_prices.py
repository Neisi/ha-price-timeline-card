# set_tibber_prices.py

entity_id = data.get("entity_id", "sensor.tibber_prices")
state_value = data.get("state", "unknown")
prices_raw = data.get("prices", [])

hass.states.set(
    entity_id,
    state_value,
    {"data": prices_raw}
)