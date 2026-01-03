const siteConfig = {
  siteName: '<your-blog-name>',
  siteDescription: '<your-site-description>',
  author: '<your-author-name>',
  authorGreet: '<your-author-greet>',
  authorDescription: '<your-author-description>',
  socialLinks: [
    { name: 'GitHub', url: 'https://github.com' },  // Replace with your GitHub URL
    // You can add more social links here
  ],
  /**
   * Header background configuration
   * This will determine the home page's header background, using a default gradient or a media file.
   */
  headerBackground: {
    /** Available: 'default' (default gradient background), 'custom' (image/video) */
    type: 'default',

    /** The path to the midea file, they must be in the public folder. If the relative path is `public/img.png`, it will be `/img.png`.
     *  Only available if headerBackground.type is `custom`.
     *  Also note that please make sure the media resolution is appropriate for the background's size, or it will be cropped.
     */
    mediaPath: ''
  },
};

export default siteConfig;