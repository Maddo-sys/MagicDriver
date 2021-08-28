export const getCarId = /* GraphQL */ `
  query GetCar($id: ID!) {
    getCar(id: $id) {
      id
    }
  }
`;

export const getCar = /* GraphQL */ `
  query GetCar($id: ID!) {
    getCar(id: $id) {
      id
      type
      latitude
      longitude
      heading
      userId
      user {
        id
        username
        email 
        createdAt
        updatedAt
      }
      isOnline
      createdAt
      updatedAt
    }
  }
`;