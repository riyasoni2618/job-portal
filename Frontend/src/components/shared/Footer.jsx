import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-xs py-8 text-foreground transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Hirely<span className="text-[#7209b7]">AI</span></h2>
            <p className="text-sm text-muted-foreground mt-1">© 2026 HirelyAI. All rights reserved.</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://facebook.com" className="text-muted-foreground hover:text-[#7209b7] dark:hover:text-purple-400 transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .733.593 1.325 1.325 1.325h11.493v-9.294h-3.13v-3.626h3.13v-2.193c0-3.111 1.894-4.811 4.659-4.811 1.325 0 2.464.099 2.795.143v3.25l-1.936.001c-1.527 0-1.823.725-1.823 1.782v2.345h3.628l-.474 3.626h-3.154v9.293h6.111c.732 0 1.325-.593 1.325-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
              </svg>
            </a>
            <a href="https://twitter.com" className="text-muted-foreground hover:text-[#7209b7] dark:hover:text-purple-400 transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.795-1.574 2.164-2.722-.951.565-2.002.977-3.128 1.196-.897-.955-2.175-1.553-3.593-1.553-2.71 0-4.912 2.202-4.912 4.912 0 .385.044.755.127 1.111-4.085-.205-7.712-2.162-10.138-5.145-.424.729-.668 1.579-.668 2.484 0 1.705.869 3.208 2.188 4.098-.807-.026-1.566-.248-2.228-.616v.061c0 2.388 1.698 4.378 3.948 4.832-.414.111-.852.17-1.298.17-.319 0-.629-.031-.931-.088.631 1.956 2.445 3.376 4.595 3.416-1.685 1.323-3.811 2.112-6.111 2.112-.397 0-.79-.023-1.175-.069 2.179 1.397 4.767 2.213 7.547 2.213 9.058 0 14.013-7.501 14.013-14.014 0-.214-.005-.426-.014-.637 1.21-1.042 2.257-2.34 3.098-3.811z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" className="text-muted-foreground hover:text-[#7209b7] dark:hover:text-purple-400 transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-9.479c0-2.276-1.13-3.554-3.534-3.554-1.423 0-2.28.679-2.676 1.319h-.096v-1.114h-3.555v12.828h3.555v-8.375c0-.447.071-.894.256-1.218.423-.74 1.341-1.503 2.684-1.503 1.94 0 3.05 1.55 3.05 3.864v9.223h3.554v-9.48c0-2.276-1.13-3.554-3.534-3.554-1.423 0-2.28.679-2.676 1.319h-.096v-1.114h-3.555v12.828h3.555v-8.375zM4.891 18.531c1.233 0 1.996-.757 1.996-1.782.023-1.025-.757-1.781-1.973-1.781-1.216 0-1.996.756-1.996 1.781 0 1.025.757 1.782 1.973 1.782h.023zm3.554-1.921c0 1.758-1.55 2.56-3.554 2.56h-3.555v-12.828h3.555v10.268zm-3.554 0c-.002.447.071.894.256 1.218.423.74 1.341 1.503 2.684 1.503 1.94 0 3.05 1.55 3.05 3.864v9.223h3.554v-9.48c0-2.276-1.13-3.554-3.534-3.554-1.423 0-2.28.679-2.676 1.319h-.096v-1.114h-3.555v12.828h3.555v-8.375z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;