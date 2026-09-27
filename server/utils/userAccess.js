const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase()

const isSuperuserEmail = (email) => email?.toLowerCase() === ADMIN_EMAIL

const hasAdministratorAccess = (user) => Boolean(user && (isSuperuserEmail(user.email) || user.admin_access))

const publicUser = (user) => {
  const isSuperuser = isSuperuserEmail(user.email)
  const adminAccess = Boolean(user.admin_access)

  return {
    id: user.id,
    username: user.username || user.name,
    email: user.email,
    role: isSuperuser ? 'superuser' : adminAccess ? 'admin' : 'user',
    admin_access: adminAccess,
    is_superuser: isSuperuser,
  }
}

const publicProfile = (user) => ({
  ...publicUser(user),
  name: user.name || user.username,
  address: user.address,
  phone_number: user.phone_number,
  profile_pic: user.profile_pic,
})

module.exports = {
  ADMIN_EMAIL,
  hasAdministratorAccess,
  isSuperuserEmail,
  publicProfile,
  publicUser,
}
