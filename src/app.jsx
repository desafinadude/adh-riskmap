import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import _ from 'lodash';
import * as URI from 'uri.js';
import './app.scss';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'

import Icon from '@mdi/react';
import { mdiRefresh } from '@mdi/js';
import { mdiPlay } from '@mdi/js';

import * as countriesList from './data/countries.json';

import { RiskMap } from './components/RiskMap';
import { Leaderboard } from './components/Leaderboard';
import { CountryData } from './components/CountryData';



export class App extends React.Component {

    constructor(){
        super();
        this.state = {
            loading: true,
            data: [],
            dates: [],
            currentDate: '',
            currentDateCount: undefined,
            selectedDateData: [],
            playingTimeline: false,
            selectedCountries: []
        }
    }

    componentDidMount() {
        let self = this;
        axios.get('http://adhtest.opencitieslab.org/api/3/action/datastore_search?resource_id=210404fe-e864-4aec-94a2-89764b7ba4b3&limit=100000')
        .then(function(response) {
            self.setState({data: response.data.result.records});
            let dates = _.map(_.uniqBy(response.data.result.records, 'date'),'date');
            dates = _.orderBy(dates, [(date) => new Date(date)], ['asc']);
            self.setState({dates: dates});
            self.setState({loading: false});
        })

        console.log(URI.query(window.location));

    }

    onUpdate = (render, handle, value, un, percent) => {
        let self = this;
        this.setState({
          currentDate: this.state.dates[parseInt(value[0]-1)],
          currentDateCount: parseInt(value[0]-1),
          selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return o.date == self.state.dates[parseInt(value[0]-1)]; }),['change'],['desc'])
        });
    }

    dateSelect = () => {
        console.log(ReactDOM.findDOMNode(this.refs.daySelect));
    }

    playTimeline = () => {
        let self = this;
        this.setState({ textValue: 0, playingTimeline: !this.state.playingTimeline });

        if(this.state.playingTimeline == true) {
            setTimeout(function() { 
                if (this.state.currentDateCount < this.state.dates.length) {
                    self.setState({ 
                        currentDate: self.state.dates[self.state.currentDateCount],
                        currentDateCount: self.state.currentDateCount,
                        selectedDateData: _.orderBy(_.filter(self.state.data, function(o) { return o.date == self.state.dates[self.state.currentDateCount]; }),['change'],['desc'])
                    }); 
                }
                self.setState({currentDateCount: self.state.currentDateCount + 1});
            }, 500);
        }
    }

    countrySelect = (country) => {
        let self = this;
        if(_.find(self.state.selectedCountries, function(o) { return o.iso_code == country.iso_code }) == undefined) {
            self.setState({selectedCountries: [...self.state.selectedCountries, country]});
        }
    }

    countryRemove = (country) => {
        let self = this;

        let selectedCountries = self.state.selectedCountries;
        let keepCountries = _.filter(selectedCountries, function(o) { return o.iso_code != country; });
        self.setState({selectedCountries: keepCountries});
    }

    render() {
        return (
            this.state.loading ? 
            <>
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                    <FontAwesomeIcon icon={faCircle} pulse size="5x" className="fa-pulse"/>
                    <h3 className="mt-4">Loading</h3>
                </div>
            </> :
            <>
                <div className="header py-5">
                    <Container>
                        <Row>
                            <Col>
                                <h1>COVID-19 Resurgence Map</h1>
                            </Col>
                        </Row>

                        <Row className="mt-4">
                            <Col><h5>Select one or more countries:</h5></Col>
                        </Row>

                        <Row className="mt-2 mb-4">
                            <Col xs="auto">
                                <DropdownButton title="Choose Countries" className="country-select">
                                    {countriesList.map((country,index) => (
                                        <Dropdown.Item key={country.iso_code} onClick={() => this.countrySelect({iso_code: country.iso_code, location: country.location})}>{country.location}</Dropdown.Item>
                                    ))}
                                </DropdownButton>
                            </Col>
                            <Col>
                                {this.state.selectedCountries.map((country) => (
                                    <Button variant="control-grey" key={country.iso_code} className="mx-1" onClick={() => this.countryRemove(country.iso_code)}>
                                        <Row>
                                            <Col>
                                                <div style={{width: '1.5em', height: '1.5em', borderRadius: '50%', overflow: 'hidden', position: 'relative'}} className="border">
                                                    <ReactCountryFlag
                                                    svg
                                                    countryCode={getCountryISO2(country.iso_code)}
                                                    style={{
                                                        position: 'absolute', 
                                                        top: '30%',
                                                        left: '30%',
                                                        marginTop: '-50%',
                                                        marginLeft: '-50%',
                                                        fontSize: '2em',
                                                        lineHeight: '2em',
                                                    }}/>
                                                </div>
                                            </Col>
                                            <Col xs="auto">{country.location}</Col>
                                            <Col>
                                                <FontAwesomeIcon icon={faTimes} style={{ fontSize:"10px"}}/>
                                            </Col>
                                        </Row>
                                    </Button>
                                ))}
                            </Col>
                        </Row>

                        <Row>
                            <Col md={3}>
                                <h5 className="mt-1">Current date showing:</h5>
                                <h1 style={{fontWeight: 500}}>
                                    {
                                        new Date(this.state.currentDate).toLocaleDateString(
                                            'en-gb',
                                            {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                            }
                                        )
                                    }
                                </h1>
                            </Col>
                            <Col md={6}>
                                <h5 className="mt-1">Scrub the timeline to change date:</h5>
                                <Row>
                                    <Col xs={1}>
                                        <OverlayTrigger
                                        placement="bottom"
                                        overlay={<Tooltip>Play through entire timeline</Tooltip>}>
                                            <Button variant="control-grey">
                                                <Icon 
                                                    onClick={this.playTimeline}
                                                    path={mdiPlay}
                                                    size={1}
                                                    horizontal
                                                    vertical
                                                    rotate={180}
                                                    color="#094151"
                                                    />
                                            </Button>
                                        </OverlayTrigger>
                                    </Col>
                                    <Col>
                                        <div className="bg-control-grey px-4 h-100 rounded">
                                            { this.state.dates.length > 0 ?
                                            <Nouislider
                                                onUpdate={this.onUpdate}
                                                range={{ min: 1, max: this.state.dates.length }}
                                                start={[this.state.dates.length]}
                                                pips= {{
                                                    mode: 'count',
                                                    values: 6,
                                                    density: 4,
                                                    stepped: true
                                                }}
                                            />
                                            : ''}
                                        </div>
                                    </Col>
                                </Row>
                                
                            </Col>
                            <Col md={3} className="timeline-date-select">
                                <h5 className="mt-1">Or select a specific date:</h5>
                                <Row className="gx-2">
                                    <Col xs="auto">
                                        <DropdownButton ref="daySelect" title={ new Date(this.state.currentDate).toLocaleDateString('en-gb', { day: 'numeric' }) } variant="control-grey" style={{height: '100%'}}>
                                            { Array.from({length: 31}, (x, i) => 
                                                <Dropdown.Item key={i} onClick={() => this.dateSelect()}>{i+1}</Dropdown.Item>
                                            )}
                                        </DropdownButton>
                                    </Col>
                                    <Col>
                                        <DropdownButton ref="monthSelect" title={ new Date(this.state.currentDate).toLocaleDateString('en-gb', { month: 'short' }) } variant="control-grey" style={{height: '100%'}}>
                                            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((month,index) => {
                                                <Dropdown.Item key={index} onClick={() => this.dateSelect()}>{month}</Dropdown.Item>
                                            })}
                                        </DropdownButton>
                                    </Col>
                                    <Col>
                                        <DropdownButton ref="yearSelect" title={ new Date(this.state.currentDate).toLocaleDateString('en-gb', { year: 'numeric' }) } variant="control-grey" style={{height: '100%'}}>
                                            <Dropdown.Item key={2020} onClick={() => this.dateSelect()}>2020</Dropdown.Item>
                                            <Dropdown.Item key={2021} onClick={() => this.dateSelect()}>2021</Dropdown.Item>
                                        </DropdownButton>
                                    </Col>
                                    <Col xs="auto">
                                        <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Jump to most recent</Tooltip>}>
                                            <Button variant="control-grey" style={{height: '100%'}}>
                                                <Icon 
                                                    path={mdiRefresh}
                                                    size={1}
                                                    horizontal
                                                    vertical
                                                    rotate={180}
                                                    color="#094151"
                                                    />
                                            </Button>
                                        </OverlayTrigger>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        

                    </Container>
                </div>

                <Container className="mt-5">
                    <Row>
                        <Col md={6}>
                            <RiskMap onCountrySelect={this.countrySelect} data={this.state.selectedDateData}/>
                        </Col>
                        <Col>
                            { 
                                this.state.selectedCountries.length > 0 ? 
                                    <CountryData selectedCountries={this.state.selectedCountries} /> 
                                :
                                    <Leaderboard data={this.state.selectedDateData}/>
                                    
                            }
                        </Col>
                    </Row>
                </Container>
            </>)
        
    }

}


const container = document.getElementsByClassName('app')[0];

ReactDOM.render(React.createElement(App), container);