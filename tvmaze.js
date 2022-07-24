"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

/* Given a search term, search TV Maze API for matching shows */
async function getShowsByTerm(term) {
  let showData = [] // Array full of show objects
  let i = 0 // Index of show in array
  
  // HTTP Request
  const resp = await axios.get('https://api.tvmaze.com/search/shows', {params: {q: term}})

  // For each show in the resp, add object with its data to showData
  for (let show in resp.data) {
    showData[i] = {
      id: resp.data[i].show.id,
      name: resp.data[i].show.name,
      summary: resp.data[i].show.summary
    }

    // Handle image
    if (resp.data[i].show.image) {
      showData[i].image = resp.data[i].show.image.original
    } else {
      showData[i].image = 'https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300'
      }
    i++
    }
  return showData
  } 

/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src= ${show.image}
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-primary btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);
      }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  
  const shows = await getShowsByTerm(term);
  $("#search-query").val('')
  $episodesArea.hide();
  populateShows(shows);
}

/** Calls searchForShowAndDisplay() when form is submitted */
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) { 
  
  const resp = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`)
  
  let i = 0
  let episodes = []
  for (let episode of resp.data) {
      episodes[i] = {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }
    i++
  }
  console.log(episodes)
  return episodes
}


/** Find episodes of show and put each in an object in an array of episodes
 *  in the format {name, season, number}  */
function populateEpisodes(episodes) {
  // $episodesList = $('#episodes-list')
  // console.log(episodes)
  for (let episode of episodes) {
   const $episode = $(
    `<li>
    ${episode.name} (season ${episode.season}, number ${episode.number})
     </li>`
   )
    $episode.appendTo($episodesArea)
 }
}

/** Handles episode button click, displays episodes for one show at a time */
$('#shows-list').on('click', async function(evt) {
  if (evt.target.classList.contains('btn')) {
    
    // Show episodes area
    $episodesArea.show();

    // Remove whatever is there
    $episodesArea.children().remove('li')

    // Populate with new episodes
    let id = $(evt.target).closest('.Show').data('show-id')
    let episodes = await getEpisodesOfShow(id)
    populateEpisodes(episodes)
  }
})
