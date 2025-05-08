
// Google Sheets API integration
const SHEET_ID = '1XAUwcOptPtAEpheciNlBX7XsufBEnsxwyiaikO9hxWA';
const BASE_URL = `https://script.google.com/macros/s/AKfycbzOQKTlGrs0ttXE56YeXLbDEySXuErEC65j7f31LrIb2h8dMlUV3WqOk3N9vgkL3YIq/exec`;

interface SheetApiRequestOptions {
  action: string;
  sheet: string;
  data?: Record<string, any>;
  id?: string;
}

export const sheetsApi = {
  // Fetch data from a specific sheet
  fetchData: async (sheetName: string) => {
    try {
      const url = `${BASE_URL}?action=read&sheet=${sheetName}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  },

  // Add a new row to a sheet
  addRow: async (sheetName: string, rowData: Record<string, any>) => {
    try {
      const url = `${BASE_URL}`;
      const formData = new FormData();
      formData.append('action', 'create');
      formData.append('sheet', sheetName);
      formData.append('data', JSON.stringify(rowData));

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error adding row:", error);
      throw error;
    }
  },

  // Update an existing row
  updateRow: async (sheetName: string, rowId: string, rowData: Record<string, any>) => {
    try {
      const url = `${BASE_URL}`;
      const formData = new FormData();
      formData.append('action', 'update');
      formData.append('sheet', sheetName);
      formData.append('id', rowId);
      formData.append('data', JSON.stringify(rowData));

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating row:", error);
      throw error;
    }
  },

  // Delete a row
  deleteRow: async (sheetName: string, rowId: string) => {
    try {
      const url = `${BASE_URL}`;
      const formData = new FormData();
      formData.append('action', 'delete');
      formData.append('sheet', sheetName);
      formData.append('id', rowId);

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting row:", error);
      throw error;
    }
  },

  // Authentication check against the Login sheet
  authenticate: async (username: string, password: string) => {
    try {
      // Fetch all login data
      const loginData = await sheetsApi.fetchData('Login');
      
      // Find matching user
      const user = loginData.data.find(
        (user: any) => user.username === username && user.password === password
      );
      
      if (user) {
        return { 
          success: true, 
          userType: user.userType, // admin or user
          userData: user
        };
      }
      
      return { success: false, message: 'Invalid username or password' };
    } catch (error) {
      console.error("Authentication error:", error);
      return { success: false, message: 'Authentication error occurred' };
    }
  },

  // Register new user
  registerUser: async (userData: { username: string; password: string; userType: string }) => {
    try {
      // First check if username already exists
      const loginData = await sheetsApi.fetchData('Login');
      const userExists = loginData.data.some(
        (user: any) => user.username === userData.username
      );
      
      if (userExists) {
        return { success: false, message: 'Username already exists' };
      }
      
      // Add new user
      await sheetsApi.addRow('Login', userData);
      return { success: true, message: 'User registered successfully' };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: 'Registration error occurred' };
    }
  }
};
