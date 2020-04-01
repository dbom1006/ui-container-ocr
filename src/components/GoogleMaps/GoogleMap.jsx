import React from 'react';
import GoogleMapReact from 'google-map-react';
import { GOOGLE_API_KEY } from '@/utils/constants';

const GoogleMap = ({ children, height = 250, ...props }) => (
  <div style={{ height }}>
    <GoogleMapReact
      bootstrapURLKeys={{
        key: GOOGLE_API_KEY,
        libraries: ['places'],
      }}
      {...props}
    >
      {children}
    </GoogleMapReact>
  </div>
);

export default GoogleMap;
