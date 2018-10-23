import React, { Component, Fragment } from 'react';
import 'whatwg-fetch';
import { Venue } from './Venue';
import { Search } from './Search';

const BLACK_MARKER = 'https://i.imgur.com/8dOrls4.png?2';
const GREEN_MARKER = 'https://i.imgur.com/9v6uW8U.png';

class NearbyFriends extends Component {
	state = { people: [], venues: [] };

	componentDidMount() {
		this.getVenues('Gas Stations');
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

	updatePeople = (people) => this.setState({ people });

	render() {
		console.log('this.state.venues', this.state.venues);
		var venueList = this.state.venues.map(
			(item, i) => (
				<Venue
					key={i}
					lat={item.venue.location.lat}
					lng={item.venue.location.lng}
					name={item.venue.name}
				/>
			) //Create a new "name attribute"
		);
		var peopleAsVenues = this.state.venues.map(
			(item, i) => {
				let id = i;
				let position = {lat: item.venue.location.lat, lng: item.venue.location.lng};
				let name = item.venue.name;
				let online = true;
				let within = true;
				return {
					name,
					id,		
					position,						
					online,
					within
				}
				console.log('position', position)
			}
				 
				 
			) //Create a new "name attribute"
		const { personVenu } = this.state.venues;
	 
		let { people } = this.state;
		people = [...peopleAsVenues , ...people];
		console.log('people merged', people)
		const {
			person: { name, id }
		} = this.props;

		const nameBadgeStyles = {
			fontSize: '0.8rem',
			height: 40,
			borderRadius: 20,
			cursor: 'pointer'
		};

		const showPeople = (filterFn, marker) => {
			return (
				<Fragment>
					{people.filter(filterFn).map((person, index) => {
						if (person.id === id) return null;
						return (
							<div
								key={index}
								className="d-flex border-bottom border-gray w-100 px-4 py-3 font-weight-bold text-secondary align-items-center"
							>
								<div className="pl-2" style={{ width: 30, height: 30 }}>
									<img src={marker} className="img-fluid" alt="marker" />
								</div>
								<span className="pl-3">{person.name}</span>
							</div>
						);
					})}
				</Fragment>
			);
		};

		return (
			id && (
				<Fragment>
					<div>
						<Search onSubmit={(value) => this.handleSubmit(value)} />
						<ul>{venueList}</ul>
					</div>
					<div
						className="border-bottom border-gray w-100 px-2 d-flex align-items-center bg-white justify-content-between"
						style={{ height: 90 }}
					>
						<span className="h4 text-dark mb-0 mx-4 font-weight-bold">
							Nearby Friends
						</span>
						<span
							className="d-flex align-items-center text-center text-white bg-primary font-weight-bold py-2 px-4 mx-4"
							style={nameBadgeStyles}
							title={name}
						>
							{name}
						</span>
					</div>

					<div
						className="w-100 d-flex flex-wrap align-items-start align-content-start position-relative"
						style={{ height: 'calc(100% - 90px)', overflowY: 'auto' }}
					>
						{showPeople((person) => person.within, GREEN_MARKER)}
						{showPeople((person) => !person.within, BLACK_MARKER)}
					</div>
				</Fragment>
			)
		);
	}
}

export default NearbyFriends;
