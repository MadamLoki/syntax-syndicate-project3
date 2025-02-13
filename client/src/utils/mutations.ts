import { gql } from "@apollo/client"

export const AddProfile = gql `
    mutation AddProfile($input: ProfileInput!) {
      addProfile(input: $input) {
        token
        profile {
          email
          name
          password
          skills
          _id
        }
      }
    }`;