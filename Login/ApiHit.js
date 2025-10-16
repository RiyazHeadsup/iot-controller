import axios from "axios";
import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAcessToken } from "../storage/Storage";
import { graphql } from "../utils/Constant";

// ===== EXISTING REST API FUNCTIONS (Keep as is) =====

// const getUnitId = () => {
//   const selectedUnit = getSelectedUnit();
//   return selectedUnit?.unitIds || null;
// };

export const HitApi = (json, api) => {
  return new Promise(function (resolve, reject) {
    const headers = { 'Content-Type': 'application/json' };
    var bearerToken = getAcessToken();
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }
    const requestPayload = {
      ...json,// Only add unitId if it exists
    };

    console.log("Request payload with unitId:", requestPayload);

    const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestPayload)
    };

    fetch(api, requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          console.log('result----', result);
          resolve(result);
        },
        (error) => {
          console.log('error----', error);
          reject(error);
        }
      ).catch((err) => {
        reject(err);
      })
  });
}

export const HitApiFormData = async (data, url, method = 'POST', additionalHeaders = {}) => {
  // Debug logging

  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value, value.name || 'file');
    } else {
      formData.append(key, value);
    }
  });

  try {
    // Ensure method is a string and handle potential issues
    const httpMethod = String(method).toUpperCase();

    console.log('Making axios request with method:', httpMethod);

    const response = await axios({
      url: url,
      method: httpMethod,
      data: formData,
      headers: {
        // Don't set Content-Type manually for FormData, let axios handle it
        ...additionalHeaders,
      },
    });

    return response.data;
  } catch (error) {
    console.error('HitApiFormData error:', error);
    throw error;
  }
};

export const bulkApiHit = async (file, url, additionalHeaders = {}) => {
  try {
    console.log("Uploading file:", file?.name || 'Unknown file');
    console.log("API URL:", url);

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios({
      url,
      method: 'POST',
      data: formData,
      headers: {
        ...additionalHeaders,
      },
      timeout: 30000,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      }
    });

    console.log('Bulk upload successful:', response.data);
    return response.data;

  } catch (error) {
    console.error('Bulk upload failed:', error);

    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data?.message || 'Server error occurred',
        data: error.response.data
      };
    } else if (error.request) {
      throw {
        status: 0,
        message: 'Network error - no response from server',
        data: null
      };
    } else {
      throw {
        status: -1,
        message: error.message || 'Unknown error occurred',
        data: null
      };
    }
  }
};

export const bulkApiHitAdvanced = async (file, url, options = {}) => {
  const {
    fieldName = 'file',
    method = 'POST',
    timeout = 30000,
    additionalHeaders = {},
    additionalData = {},
    onProgress = null
  } = options;

  try {
    console.log(`Uploading file: ${file?.name || 'Unknown file'}`);
    console.log(`API URL: ${url}`);

    const formData = new FormData();
    formData.append(fieldName, file);

    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const config = {
      url,
      method,
      data: formData,
      headers: {
        ...additionalHeaders,
      },
      timeout,
    };

    if (onProgress && typeof onProgress === 'function') {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted, progressEvent);
      };
    }

    const response = await axios(config);

    console.log('Bulk upload successful:', response.data);
    return {
      success: true,
      data: response.data,
      status: response.status
    };

  } catch (error) {
    console.error('Bulk upload failed:', error);

    return {
      success: false,
      error: {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Upload failed',
        data: error.response?.data || null
      }
    };
  }
};

// ===== SIMPLIFIED APOLLO CLIENT SETUP (HTTP ONLY) =====

// HTTP Link for queries and mutations
const httpLink = createHttpLink({
  uri: graphql

});

// Auth Link for HTTP requests
const authLink = setContext((_, { headers }) => {
  const token = getAcessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Create Apollo Client instance (HTTP only for now)
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    addTypename: false,
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network'
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    },
    mutate: {
      errorPolicy: 'all'
    }
  }
});

// ===== GRAPHQL FUNCTIONS =====

// Updated HitGraphQLApollo function to handle hardcoded mutations properly
export const HitGraphQLApollo = async (query, variables = {}, options = {}) => {
  try {
    console.log("GraphQL Operation:");
    console.log(query);
    console.log("Variables:", variables);

    const { operation = 'query', fetchPolicy = 'cache-first' } = options;

    // Extract operation name from the query
    const operationNameMatch = query.match(/(?:mutation|query)\s+(\w+)/);
    const operationName = operationNameMatch ? operationNameMatch[1] : null;

    // Create the payload in the format you want
    const payload = {
      operationName: operationName,
      variables: variables, // Will be {} for hardcoded mutations
      query: query
    };

    console.log("Apollo GraphQL Payload:");
    console.log(JSON.stringify(payload, null, 4));

    let result;

    if (operation === 'mutation') {
      result = await apolloClient.mutate({
        mutation: gql`${query}`,
        variables,
        errorPolicy: 'all',
        context: {
          operationName: operationName
        }
      });
    } else {
      result = await apolloClient.query({
        query: gql`${query}`,
        variables,
        fetchPolicy,
        errorPolicy: 'all',
        context: {
          operationName: operationName
        }
      });
    }

    console.log('Apollo GraphQL Result:', result.data);
    return result.data;

  } catch (error) {
    console.error('Apollo GraphQL Error:', error);

    // Log more detailed error information
    if (error.networkError) {
      console.error('Network Error:', error.networkError);
      console.error('Network Error Body:', error.networkError.result);
    }

    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      console.error('GraphQL Errors:', error.graphQLErrors);
    }

    throw {
      status: error.networkError?.statusCode || 0,
      message: error.message || 'GraphQL operation failed',
      graphqlErrors: error.graphQLErrors || [],
      networkError: error.networkError || null
    };
  }
};

// Alternative function that uses raw HTTP request for hardcoded mutations
export const HitGraphQLRaw = async (query, variables = {}) => {
  try {
    // Extract operation name from the query
    const operationNameMatch = query.match(/mutation\s+(\w+)/);
    const operationName = operationNameMatch ? operationNameMatch[1] : null;

    // Create the payload in the exact format you want
    const payload = {
      operationName: operationName,
      variables: variables, // This will be empty {} for hardcoded mutations
      query: query
    };

    console.log("Raw GraphQL Payload:", JSON.stringify(payload, null, 2));

    // Get the GraphQL endpoint from your constants
    const graphqlEndpoint = graphql; // This should be your GraphQL URL

    // Get auth token
    const token = getAcessToken();

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    console.log('Raw GraphQL Result:', result);

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(result.errors[0].message || 'GraphQL Error');
    }

    return result.data;

  } catch (error) {
    console.error('Raw GraphQL Error:', error);
    throw {
      status: 0,
      message: error.message || 'GraphQL operation failed',
      graphqlErrors: [],
      networkError: error
    };
  }
};

// ===== BACKWARD COMPATIBLE FUNCTIONS =====

export const HitGraphQLApi = async (query, variables = {}, endpoint) => {
  console.log("GraphQL Query:", query);
  console.log("Variables:", variables);
  console.log("Endpoint:", endpoint);

  try {
    const result = await HitGraphQLApollo(query, variables, { operation: 'query' });
    return result;
  } catch (error) {
    throw new Error(error.message || 'GraphQL Error');
  }
};

export const HitGraphQLApiAxios = async (query, variables = {}, endpoint) => {
  console.log("GraphQL Query:", query);
  console.log("Variables:", variables);
  console.log("Endpoint:", endpoint);

  try {
    const isMutation = query.trim().toLowerCase().startsWith('mutation');
    const operation = isMutation ? 'mutation' : 'query';

    const result = await HitGraphQLApollo(query, variables, { operation });
    return result;
  } catch (error) {
    throw {
      status: error.status || 0,
      message: error.message || 'Network error occurred',
      graphqlErrors: error.graphqlErrors || []
    };
  }
};

// ===== SPECIFIC USE CASE FUNCTIONS =====

// Updated seat mutation using Apollo Client
export const updateSeatMutation = async (id, input) => {
  const mutation = `
    mutation UpdateSeat($id: String!, $input: UpdateSeatsInput!) {
      updateSeat(id: $id, input: $input) {
        success
        message
        data {
          _id
          seatName
          seatFor
          status
          seatCode
        }
      }
    }
  `;

  const variables = { id, input };

  try {
    const result = await HitGraphQLApollo(mutation, variables, { operation: 'mutation' });
    return result.updateSeat;
  } catch (error) {
    console.error('Update seat mutation failed:', error);
    throw error;
  }
};

// Simple subscription using manual WebSocket (temporary solution)
export const subscribeSeatUpdates = (seatId, callback) => {
  console.log('Setting up manual subscription for seat:', seatId);

  // For now, we'll use polling as a simple subscription alternative
  let isActive = true;

  const pollForUpdates = async () => {
    while (isActive) {
      try {
        // You can implement polling here or use manual WebSocket
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds

        // For demonstration - you would fetch seat data here
        console.log('Polling for seat updates...');

      } catch (error) {
        console.error('Polling error:', error);
        if (callback) callback(null, error);
      }
    }
  };

  pollForUpdates();

  // Return unsubscribe function
  return () => {
    isActive = false;
    console.log('Stopped polling for seat updates');
  };
};

// ===== UTILITY FUNCTIONS =====

export const clearGraphQLCache = () => {
  return apolloClient.clearStore();
};

export const refetchAllQueries = () => {
  return apolloClient.refetchQueries({
    include: 'active',
  });
};

export const getGraphQLConnectionStatus = () => {
  return {
    client: apolloClient,
    cache: apolloClient.cache,
    link: apolloClient.link,
  };
};

// Export gql template literal for external use
export { gql };

// Export Apollo Client as default
export default apolloClient;