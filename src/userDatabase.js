// In-memory user database (singleton pattern)
const userDatabase = (() => {
  let users = [];
  let walletUsers = [];

  return {
    getUsers: () => users,
    addUser: (user) => users.push(user),
    getWalletUsers: () => walletUsers,
    addWalletUser: (walletAddress) => walletUsers.push(walletAddress),
    clearWalletUser: (walletAddress) => {
      walletUsers = walletUsers.filter((addr) => addr !== walletAddress);
    },
    updateUser: (email, updates) => {
      users = users.map((user) =>
        user.email === email ? { ...user, ...updates } : user
      );
    },
  };
})();

export default userDatabase; 
