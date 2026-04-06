export const LoginService = {
  async loginWithPin(enteredPin) {
    const CORRECT_PIN = '1975';

    if (enteredPin === CORRECT_PIN) {
      return {
        success: true,
        message: 'Login successful',
      };
    }

    return {
      success: false,
      message: 'Wrong PIN',
    };
  },
};
