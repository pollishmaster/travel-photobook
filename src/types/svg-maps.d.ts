declare module "@svg-maps/world" {
  interface Location {
    id: string;
    path: string;
    name: string;
  }

  interface WorldMap {
    viewBox: string;
    locations: Location[];
  }

  const world: WorldMap;
  export default world;
}
