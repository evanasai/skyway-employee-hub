
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      addListener(eventName: string, handler: Function): void;
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      scaleControl?: boolean;
      streetViewControl?: boolean;
      rotateControl?: boolean;
      fullscreenControl?: boolean;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      addListener(eventName: string, handler: Function): void;
      setMap(map: Map | null): void;
      getPosition(): LatLng | undefined;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      draggable?: boolean;
      title?: string;
      icon?: string | Icon;
    }

    interface Icon {
      url: string;
      scaledSize?: Size;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Polygon {
      constructor(opts?: PolygonOptions);
      addListener(eventName: string, handler: Function): void;
      setMap(map: Map | null): void;
    }

    interface PolygonOptions {
      paths?: LatLng[] | LatLng[][] | LatLngLiteral[] | LatLngLiteral[][];
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      editable?: boolean;
      map?: Map;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      setContent(content: string): void;
      setPosition(position: LatLng | LatLngLiteral): void;
      open(map: Map): void;
    }

    interface InfoWindowOptions {
      content?: string;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLngBounds {
      constructor();
      extend(point: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
    }

    interface MapMouseEvent {
      latLng?: LatLng;
    }

    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        bindTo(key: string, target: any): void;
        addListener(eventName: string, handler: Function): void;
        getPlace(): PlaceResult;
      }

      interface AutocompleteOptions {
        bounds?: LatLngBounds;
      }

      interface PlaceResult {
        geometry?: {
          location?: LatLng;
        };
      }
    }
  }
}
