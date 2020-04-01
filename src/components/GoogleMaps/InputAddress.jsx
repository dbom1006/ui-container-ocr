import React, { Component } from 'react';
import { Input } from 'antd';

class InputAddress extends Component {
  componentDidMount() {
    const { map, mapApi, initialValue, id } = this.props;
    this.setState(
      {
        eventAddress: initialValue || '110 Marlborough St, Boston, MA 02116, USA',
      },
      () => {
        this.geocoder = new mapApi.Geocoder();
        this.geocoder.geocode(
          { address: this.state.eventAddress },
          (results, status) => {
            if (status === 'OK') {
              map.setCenter(results[0].geometry.location);
              this.marker = new mapApi.Marker({
                map,
                position: results[0].geometry.location,
                draggable: true,
              });
              this.inputHtml = document.getElementById(id);
              this.autoComplete = new mapApi.places.Autocomplete(this.inputHtml);
              this.autoComplete.addListener('place_changed', this.onAutoComplete);
              mapApi.event.addListener(this.marker, 'dragend', this.onDragendMarker);
              this.autoComplete.bindTo('bounds', map);
            }
          },
          this,
        );
      },
    );
  }

  onDragendMarker = ({ latLng }) => {
    const { map, disabled } = this.props;
    if (disabled) return;
    map.setCenter(latLng);
    this.geocoder.geocode({ latLng }, (results, status) => {
      if (status === 'OK') {
        this.onChangeLocationAddress(results[0]);
      }
    });
  };

  componentWillReceiveProps = next => {
    const { location = [] } = this.props;
    if (
      next.location &&
      next.location[0] &&
      (location[0] != next.location[0] || location[1] != next.location[1])
    ) this.changeLocationMarker(next.location);
  };

  changeLocationMarker = ([lat, lng]) => {
    const { mapApi, map } = this.props;
    const location = new mapApi.LatLng(lat, lng);
    this.marker && this.marker.setPosition(location);
    map.setCenter(location);
  };

  onChangeLocationAddress = (place, address) => {
    const { map, onChange, mapApi } = this.props;
    this.marker.setVisible(false);
    if (!place.geometry) return;
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(14);
    }
    this.marker.setPosition(place.geometry.location);
    this.marker.setVisible(true);
    const selectedAddress = address || place.formatted_address;
    onChange(
      selectedAddress,
      place.geometry.location.lat(),
      place.geometry.location.lng(),
      place.address_components,
    );
    this.inputHtml.value = selectedAddress;
  };

  onAutoComplete = () => {
    const place = this.autoComplete.getPlace();
    this.onChangeLocationAddress(place, this.inputHtml.value);
  };

  componentWillUnmount({ mapApi, id } = this.props) {
    document.getElementById(id) && mapApi.event.clearInstanceListeners(document.getElementById(id));
  }

  render() {
    const {
      initialValue,
      name = 'eventAddress',
      placeholder = 'Enter address',
      map,
      mapApi,
      ...rest
    } = this.props;
    return (
      <Input
        {...rest}
        defaultValue={initialValue}
        name={name}
        placeholder={placeholder}
        autoComplete="off"
      />
    );
  }
}

export default InputAddress;
