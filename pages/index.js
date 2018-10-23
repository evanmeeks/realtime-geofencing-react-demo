import React, { Component, Fragment } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { Venue } from '../components/Venue';
// import { Search } from './Search';
import Map from '../components/Map';
import Layout from '../components/Layout';
import ChoosePersona from '../components/ChoosePersona';
import NearbyFriends from '../components/NearbyFriends';

class IndexPage extends Component {

	state = { id: null, people: [] }

	regionFiltered = people => this.nearby.updatePeople(people)
	
 

	personaSelected = id => {
		this.setState({ id });
		axios.post(`/online/${id}`);
	}

	endConnection = () => {
		this.pusher.disconnect();
		axios.post(`/offline/${this.state.id}`);
	}

	handleSubmit(query) {
		this.getVenues(query);
	}

	getVenues(query) {
		let setVenueState = this.setState.bind(this);

		const venuesEndpoint = 'https://api.foursquare.com/v2/venues/explore?';

		this.getLocation(function(latlong) {
			const params = {
				client_id: 'GH4BWS2A1V0K0RAIGWA401NNQ04JUIF55HUTP30LQ1IKINUL',
				client_secret: 'NRTY31TIGPDGK5GWODTMDKTQL1JTW1VKLWHWZJR425E03WSN',
				limit: 100,
				query: query,
				v: '20130619',
				ll: latlong
			};

			fetch(venuesEndpoint + new URLSearchParams(params), {
				method: 'GET'
			})
				.then((response) => response.json())
				.then((response) => {
					setVenueState({ venues: response.response.groups[0].items });
				});
		});
	}

	getLocation(callback) {
		navigator.geolocation.getCurrentPosition(function(location) {
			callback(location.coords.latitude + ',' + location.coords.longitude);
		});
	}


	componentWillMount() {
		this.pusher = new Pusher(process.env.PUSHER_APP_KEY, {
      cluster: process.env.PUSHER_APP_CLUSTER,
      encrypted: true
    });

		this.channel = this.pusher.subscribe('map-geofencing');
	}

	componentDidMount() {
		axios.get('/people').then(({ data }) => {
			const { people = [] } = data;
			console.log('data', data)
			console.log('people', people)
			this.setState({ people });
		});
		this.getVenues('Gas Stations');
		window.onbeforeunload = this.endConnection;
	}

  componentWillUnmount() {
    this.endConnection();
  }

  render() {
		console.log('this.state.venues', this.state.venues);
		// var venueList = this.state.venues.map(
		// 	(item, i) => (
		// 		<Venue
		// 			key={i}
		// 			lat={item.venue.location.lat}
		// 			lng={item.venue.location.lng}
		// 			name={item.venue.name}
		// 		/>
		// 	) //Create a new "name attribute"
		// );
		// var peopleAsVenues = this.state.venues.map(
		// 	(item, i) => {
		// 		let id = i;
		// 		let position = {lat: item.venue.location.lat, lng: item.venue.location.lng};
		// 		let name = item.venue.name;
		// 		let online = true;
		// 		let within = true;
		// 		return {
		// 			name,
		// 			id,		
		// 			position,						
		// 			online,
		// 			within
		// 		}
			 
		// 	}
				 
				 
		// 	) //Create a new "name attribute"

		const { id, people } = this.state;
		// people = [...peopleAsVenues , ...people];
		const person = people.find(person => person.id === id) || {};
		const peopleOffline = people.filter(person => !person.online);

    return (
      <Layout pageTitle="Realtime Geofencing">
        <main className="container-fluid position-absolute h-100 bg-light">
					{
						id ? <div className="row position-absolute w-100 h-100">

							<section className="col-md-9 px-0 border-right border-gray position-relative h-100">
								<Map person={person} radius={1000} people={people} channel={this.channel} onRegionFiltered={this.regionFiltered} />
							</section>

							<section className="col-md-3 position-relative d-flex flex-wrap h-100 align-items-start align-content-between bg-white px-0">
								<NearbyFriends ref={elem => this.nearby = elem} person={person} />
							</section>

						</div>

						: <ChoosePersona count={5} people={peopleOffline} onSelected={this.personaSelected} />
					}
        </main>
      </Layout>
		);

  }

};

export default () => <IndexPage />
