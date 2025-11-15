import * as functions from "firebase-functions";
import fetch from "node-fetch";

const EVENTBRITE_API_TOKEN = "AD4GKCTBOUW4VFE5F54F";

export const getEventbriteEvents = functions.https.onRequest(async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) {
      res.status(400).send("Falta parámetro 'city'");
      return;
    }

    const url = new URL("https://www.eventbriteapi.com/v3/events/search/");
    url.searchParams.append("location.address", city as string);
    url.searchParams.append("expand", "venue");

    console.log("Requesting URL:", url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${EVENTBRITE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from Eventbrite:", errorText);
      res.status(response.status).send(errorText);
      return;
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("Internal error:", error);
    res.status(500).send("Error interno");
  }
});
