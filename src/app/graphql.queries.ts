
export const LOGIN = `
  query login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }`;


export const SIGNUP = `
  mutation signup($username: String!, $email: String!, $password: String!) {
    signup(username: $username, email: $email, password: $password) {
      id
      username
      email
    }
  }`;


export const GET_ALL_EMPLOYEES = `
  query getAllEmployees {
    getAllEmployees {
      id
      firstName
      lastName
      email
      position
      department
    }
  }`;

  export const FIND_EMPLOYEE_BY_ID = `
  query findEmployeeById($id: ID!) {
      findEmployeeById(id: $id) {
          id
          firstName
          lastName
          email
          gender
          position
          salary
          joinDate
          department
          profileImage
      }
  }`;
export const FIND_EMPLOYEES_BY_POSITION_OR_DEPARTMENT = `
  query findEmployeesByPositionOrDepartment($position: String, $department: String) {
    findEmployeesByPositionOrDepartment(position: $position, department: $department) {
      id
      firstName
      lastName
      email
      position
      department
    }
  }`;
  export const ADD_EMPLOYEE = `
  mutation addEmployee(
      $firstName: String!
      $lastName: String!
      $email: String!
      $gender: String!
      $position: String!
      $salary: Float!
      $joinDate: String!
      $department: String!
      $profileImage: Upload
  ) {
      addEmployee(
          firstName: $firstName
          lastName: $lastName
          email: $email
          gender: $gender
          position: $position
          salary: $salary
          joinDate: $joinDate
          department: $department
          profileImage: $profileImage
      ) {
          id
          firstName
          lastName
          email
          gender
          position
          salary
          joinDate
          department
          profileImage
      }
  }`;

export const UPDATE_EMPLOYEE = `
  mutation updateEmployee(
      $id: ID!
      $firstName: String
      $lastName: String
      $email: String
      $gender: String
      $position: String
      $salary: Float
      $joinDate: String
      $department: String
      $profileImage: Upload
  ) {
      updateEmployee(
          id: $id
          firstName: $firstName
          lastName: $lastName
          email: $email
          gender: $gender
          position: $position
          salary: $salary
          joinDate: $joinDate
          department: $department
          profileImage: $profileImage
      ) {
          id
          firstName
          lastName
          email
          gender
          position
          salary
          joinDate
          department
          profileImage
      }
  }`;
export const REMOVE_EMPLOYEE = `
  mutation removeEmployee($id: ID!) {
    removeEmployee(id: $id)
  }`;