import React, { Component } from 'react';
export const Venue = ({ name, lat, lng }) => <li>{name} <dt>lat:{lat}&nbsp;long{lng}</dt></li>