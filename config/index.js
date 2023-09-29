const config = {
  port: process.env.PORT,
  dbConnectionString: process.env.DB_CONNECTION_STRING,
  dbConnectionStringTest: process.env.DB_CONNECTION_STRING_TEST,
  jwtKey: process.env.JWT_KEY,
  sendGrid: process.env.SENDGRID_API_KEY,
  senGridTemplateId: process.env.SENGRID_TEMPLATE_ID,
  senGridTemplateEmailVerification:
    process.env.SENGRID_TEMPLATE_EMAIL_VERIFICATION,
  templateAdoptionRequest: process.env.SENGRID_TEMPLATE_ADOPTION_REQUEST,
  templateApproved: process.env.SENDGRID_TEMPLATE_ACCEPTED,
  templateRejected: process.env.SENDGRID_TEMPLATE_REJECTED,
  senGridDonation: process.env.SENGRID_TEMPLATE_DONATION,
  epaycoApiKey: process.env.EPAYCO_PUBLIC_KEY,
  epaycoPrivateKey: process.env.EPAYCO_PRIVATE_KEY,
  adogtaPublicUrl: process.env.ADOGTA_PUBLIC_URL,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryKey: process.env.CLOUDINARY_API_KEY,
  cloudinarySecret: process.env.CLOUDINARY_API_SECRET,
};

module.exports = config;
