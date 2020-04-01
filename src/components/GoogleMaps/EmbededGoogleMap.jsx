import React from 'react';
import { GOOGLE_API_KEY } from '@/utils/constants';

const EmbededGoogleMap = ({
  address = '110 Marlborough St, Boston, MA 02116, USA',
  title = 'Event Address',
  height = 250,
  ...props
}) => (
    <iframe
      title={title}
      height={height}
      style={{ width: '100%', position: 'relative', overflow: 'hidden' }}
      frameBorder="0"
      src={`https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(
        address,
      )}&key=${GOOGLE_API_KEY}`}
      allowFullScreen
      {...props}
    />
  );
export default EmbededGoogleMap;
