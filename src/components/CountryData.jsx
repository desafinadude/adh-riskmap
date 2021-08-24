import React from 'react';
import axios from 'axios';
import _ from 'lodash';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

import ReactECharts from 'echarts-for-react';

import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCaretDown, faCaretUp, faInfo } from '@fortawesome/free-solid-svg-icons';


export class CountryData extends React.Component {
    constructor() {
        super();
        this.state = {
            selectedCountry: '',
            options: {
                grid: { top: 8, right: 8, bottom: 24, left: 36 },
                xAxis: {
                
                data: [],
                },
                yAxis: {
                    type: 'value',
                },
                series: [
                    {
                        data: [],
                        type: 'bar',
                        smooth: true,
                    },
                ],
                tooltip: {
                    trigger: 'axis',
                }
            }
        }
    }

    componentDidMount() {

        let self = this;
        self.setState({ selectedCountry: this.props.selectedCountries[0] });

        
        
        

       


    }

    componentDidUpdate() {

        let self = this;

        if(self.state.selectedCountry.iso_code != this.props.selectedCountries[0].iso_code) {
            self.setState({ selectedCountry: this.props.selectedCountries[0] });
        }

        axios.get('http://adhtest.opencitieslab.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"fc2a18a1-0c76-4afe-8934-2b9a9dacfef4"%20WHERE%20iso_code%20LIKE%20%27' + this.props.selectedCountries[0].iso_code + '%27')
        .then(function(response) {


            let dates = _.map(response.data.result.records,'date');
            let data = _.map(response.data.result.records,'new_cases');

            self.setState({
                options: {
                    grid: { top: 8, right: 8, bottom: 24, left: 36 },
                    xAxis: {
                    
                    data: [],
                    },
                    yAxis: {
                        type: 'value',
                    },
                    series: [
                        {
                            data: data,
                            type: 'bar',
                            smooth: true,
                        },
                    ],
                    tooltip: {
                        trigger: 'axis',
                    }
                }
            })
        })

        
            
        

    }

   

    render() {
        let self = this;
        return (
            <>
                <Card className="border-0 rounded">
                    <Card.Body>
                        <Row className="gx-2">
                            <Col xs="auto">
                                <div style={{width: '2em', height: '2em', borderRadius: '50%', overflow: 'hidden', position: 'relative'}} className="border">
                                    {this.state.selectedCountry.iso_code != undefined ?
                                        <ReactCountryFlag
                                        svg
                                        countryCode={getCountryISO2(this.state.selectedCountry.iso_code)}
                                        style={{
                                            position: 'absolute', 
                                            top: '30%',
                                            left: '30%',
                                            marginTop: '-50%',
                                            marginLeft: '-50%',
                                            fontSize: '2.8em',
                                            lineHeight: '2.8em',
                                        }}/> : ''
                                    }
                                </div>
                            </Col>
                            <Col>{this.state.selectedCountry.location}</Col>
                            <Col md={4} className="justify-content-between d-none d-lg-flex">
                                <Badge bg="control-grey" className="badge-data-alert">
                                    <FontAwesomeIcon icon={faClock} />
                                </Badge>
                                <Badge bg="control-grey" className="badge-data-alert">
                                    <FontAwesomeIcon icon={faInfo} />
                                </Badge>
                                <Badge bg="control-grey" className="badge-data-alert">
                                    <FontAwesomeIcon icon={faInfo} />
                                </Badge>
                                <Badge bg="control-grey" className="badge-data-alert">
                                    <FontAwesomeIcon icon={faInfo} />
                                </Badge>
                                <Badge bg="control-grey" className="badge-data-alert">
                                    <FontAwesomeIcon icon={faInfo} />
                                </Badge>
                                <Badge bg="control-grey" className="badge-data-alert">
                                    <FontAwesomeIcon icon={faInfo} />
                                </Badge>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="border-0 rounded mt-5">
                    <Card.Body>
                        <ReactECharts option={this.state.options} />
                    </Card.Body>
                </Card>


            </>
        );
    }
}