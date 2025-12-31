import * as SecureStore from 'expo-secure-store';

export class SessionManager {
  private static SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  /**
   * Check if the current session is still valid
   */
  static async isSessionValid(): Promise<boolean> {
    try {
      const sessionTimestamp = await SecureStore.getItemAsync('sessionTimestamp');
      const token = await SecureStore.getItemAsync('token');
      
      if (!sessionTimestamp || !token) {
        console.log('🔍 No session data found');
        return false;
      }
      
      const sessionTime = parseInt(sessionTimestamp);
      const currentTime = Date.now();
      const timeDiff = currentTime - sessionTime;
      
      console.log(`🕐 Session age: ${Math.round(timeDiff / (1000 * 60))} minutes`);
      
      if (timeDiff > this.SESSION_TIMEOUT) {
        console.log('⏰ Session expired, clearing data');
        await this.clearExpiredSession();
        return false;
      }
      
      console.log('✅ Session is still valid');
      return true;
    } catch (error) {
      console.error('❌ Error checking session validity:', error);
      return false;
    }
  }
  
  /**
   * Update session timestamp to extend session
   */
  static async updateSessionTimestamp(): Promise<void> {
    try {
      await SecureStore.setItemAsync('sessionTimestamp', Date.now().toString());
      console.log('🔄 Session timestamp updated');
    } catch (error) {
      console.error('❌ Error updating session timestamp:', error);
    }
  }
  
  /**
   * Clear expired session data
   */
  static async clearExpiredSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('sessionTimestamp');
      console.log('🧹 Expired session data cleared');
    } catch (error) {
      console.error('❌ Error clearing expired session:', error);
    }
  }
  
  /**
   * Get session info for debugging
   */
  static async getSessionInfo(): Promise<{
    hasToken: boolean;
    hasUser: boolean;
    sessionAge: number | null;
    isValid: boolean;
  }> {
    try {
      const token = await SecureStore.getItemAsync('token');
      const user = await SecureStore.getItemAsync('user');
      const sessionTimestamp = await SecureStore.getItemAsync('sessionTimestamp');
      
      let sessionAge = null;
      if (sessionTimestamp) {
        sessionAge = Date.now() - parseInt(sessionTimestamp);
      }
      
      const isValid = await this.isSessionValid();
      
      return {
        hasToken: !!token,
        hasUser: !!user,
        sessionAge,
        isValid
      };
    } catch (error) {
      console.error('❌ Error getting session info:', error);
      return {
        hasToken: false,
        hasUser: false,
        sessionAge: null,
        isValid: false
      };
    }
  }
}
