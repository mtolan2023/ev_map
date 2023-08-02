# ev_map
Interactive EV Map for Registrations and Charging Stations (2022):
- Explore EV registrations per state
- Examine the state of EV charging infrastructure, including by charger type.
- Search your zipcode to see if there are chargers nearby.


This map draws from the Choropleth example from Leaflet Documentation.

Data:
Zipcode data: The zipcode dataset from this github project is being used for the "zoom to zip" feature on the US map. Resource taken from M Bostock zip visualization. https://gist.github.com/mbostock/5180185#file-zipcodes-tsv

States geojson: This dataset was organized by Eric Celeste using data from the US Census Bureau. It is a public dataset but it is requested that the Census Bureau be referenced as a resource. https://eric.clst.org/tech/usgeojson/

State populations: https://www.statsamerica.org/sip/rank_list.aspx?rank_label=pop1&ct=S18

Charging station data (US Dept of Energy- Alternative Fuels Data Center): https://afdc.energy.gov/stations/
