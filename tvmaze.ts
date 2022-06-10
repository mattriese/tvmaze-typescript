import axios, { AxiosResponse } from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const BASE_URL = "http://api.tvmaze.com"

type Show = {
  id: number,
  name: string,
  summary: string,
  image: string
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<Show[]> {
  //Records[]
  let response = await axios.get(`${BASE_URL}/search/shows?q=${term}`);
  console.log(response.data)
  let shows: Record<string,any>[] = response.data;
  return shows.map(show => {
    let image = show.show.image
                ? show.show.image.medium
                : "https://duetaz.org/wp-content/uploads/2018/07/Movie-Night.jpg";
          return {
          id: show.show.id,
          name: show.show.name,
          summary: show.show.summary,
          image
        }});
}


/** Given list of shows, create markup for each and to DOM
 *
 * Testing
*/

function populateShows(shows: Show[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

type Episode = {
  id:number,
  name:string,
  season:string,
  number:string
}

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<Episode[]> {

  let response = await axios.get(`${BASE_URL}/shows/${id}/episodes`);
  let episodes: Record<string,any>[] = response.data;

  return episodes.map(episode => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season.toString(),
      number: episode.number.toString()
    }
  });

}

/** Given an array of episodes,
 * generate markup for each episode
 * and attach to #episodeList in DOM */

function populateEpisodes(episodes: Episode[]) {

  for (let episode of episodes) {
    const $episode = $(
        `<li>
        ${episode.name} (Season: ${episode.season} Episode: ${episode.number})
       </li>
      `);

  $episodesArea.append($episode);  }
 }

 /** Handle episode request: get episodes from API and displays
 *   in the episodes area
 */

async function generateEpisodeListAndDisplay(id: string) {
  console.log(id)
  const showId: number = +id
  const episodes = await getEpisodesOfShow(showId);

  $episodesArea.show();
  populateEpisodes(episodes);
}

 $showsList.on("click", ".Show-getEpisodes", async function (evt) {
  $episodesArea.empty();
  //if condition
  let id = $(evt.target).closest(".Show").attr("data-show-id");
  console.log(id);
  let showId = id as string; //tells complier to trust
  await generateEpisodeListAndDisplay(showId);
});
