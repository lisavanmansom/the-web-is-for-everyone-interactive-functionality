console.log('Hier komt je server')
/*** Express setup & start ***/

// 1. Opzetten van de webserver

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// Importeer het npm pakket express uit de node_modules map
import express from 'express'

// Stel het basis endpoint in
const apiUrl = 'https://fdnd-agency.directus.app/items'

// Maak een nieuwe express app aan
const app = express()

// Stel ejs in als template engine
// View engine zorgt ervoor dat data die je ophaalt uit de api , waar je in je code dingen mee doet, daar html van maakt
app.set('view engine', 'ejs')

// Stel de map met ejs templates in
app.set('views', './views')

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static('public'))

// Zorg dat werken met request data makkelijker wordt
app.use(express.urlencoded({ extended: true }));


/*** Routes & data ***/
const storyData = await fetchJson(apiUrl + '/tm_story')

// Maak een GET route voor de index
// Stap 1
app.get('/', function(request, response) {
  response.render('index')
})

// Stap 2
app.get('/lessons', function(request, response) {
  Promise.all([
  fetchJson('https://fdnd-agency.directus.app/items/tm_story'),
  fetchJson('https://fdnd-agency.directus.app/items/tm_language'),
  fetchJson('https://fdnd-agency.directus.app/items/tm_playlist'),
  fetchJson('https://fdnd-agency.directus.app/items/tm_audio')]).then(([storyData, languageData, playlistData, audioData]) => {
    response.render('lessons', {stories: storyData.data, 
      language: languageData.data,
      playlist: playlistData.data,
      audio: audioData.data})
  });
})

app.post('/:id/like-or-unlike', function (request, response) {
    // Step 1: Retrieve the current data for this person from the API
    fetchJson('https://fdnd-agency.directus.app/items/tm_playlist/' + request.params.id).then((apiResponse) => {
        // The custom field is a String, so we need to parse it into an Object
        try {
            apiResponse.data.playlistData = JSON.parse(apiResponse.data.playlistData);
        } catch (e) {
            apiResponse.data.playlistData = {};
        }

        // Step 2: Add the like to the custom object
        if (request.body.action == 'like') {
            apiResponse.data.playlistData.like = true;
        } else {
            apiResponse.data.playlistData.like = false;
        }

        // Step 3: Update the custom field for this person
        fetchJson('https://fdnd-agency.directus.app/items/tm_playlist/' + request.params.id, {
            method: 'PATCH',
            body: JSON.stringify({
                playlistData: apiResponse.data.playlistData // property name here
            }),
            headers: {'Content-type': 'application/json; charset=UTF-8'}

        }).then((patchResponse) => {
            // Redirect to the person's page
            response.redirect(303, '/lessons');
        });
        }).catch((error) => {
        // Handle any errors that occur during the fetch or processing
        console.error('Error:', error);
        response.status(500).send('Internal Server Error');
    });
});

// 3. Start de webserver
// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8000)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})