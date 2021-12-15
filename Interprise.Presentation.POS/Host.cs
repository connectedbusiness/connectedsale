using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;
using DevExpress.XtraEditors;

namespace Interprise.Presentation.POS
{
    public partial class Host : XtraForm
    {
        public ChromiumWebBrowser _chromeBrowser;

        public Host()
        {
            InitializeComponent();
            InitializeTargetScreenSize();
            InitializeChromium();            

            this.LookAndFeel.SetSkinStyle("Office2013White");
        }

        public void InitializeChromium()
        {
            var settings = new CefSettings();
            settings.CachePath = string.Format(@"{0}\ConnectedSale", Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData));
            Cef.EnableHighDPISupport();
            Cef.Initialize(settings); 

            var posPath = string.Format(@"{0}\WebDesktop\desktop.html", Application.StartupPath);
                
#if DEBUG            
            posPath = string.Format(@"{0}\..\pos\app\desktop.html", Application.StartupPath);
#endif

            _chromeBrowser = new ChromiumWebBrowser(posPath);
            _chromeBrowser.Dock = DockStyle.Fill;
            _chromeBrowser.Size = new Size(1024, 768);
            this.Controls.Add(_chromeBrowser);

            // Allow the use of local resources in the browser
            BrowserSettings browserSettings = new BrowserSettings();
            browserSettings.FileAccessFromFileUrls = CefState.Enabled;
            browserSettings.UniversalAccessFromFileUrls = CefState.Enabled;
            browserSettings.LocalStorage = CefState.Enabled;
            _chromeBrowser.BrowserSettings = browserSettings;

            _chromeBrowser.JavascriptObjectRepository.Register("printerTool", new PrinterTool(), true, BindingOptions.DefaultBinder);
#if DEBUG
            buttonShowDevToool.Visible = true;
            buttonReload.Visible = true;
#endif
        }

        private void InitializeTargetScreenSize()
        {
            //Determine whether to or not to set window to full screen by checking DPI settings:
            using (var graphics = this.CreateGraphics())
            {
                if (graphics.DpiX >= 100)
                    this.WindowState = FormWindowState.Maximized;
            }            
        }

        private void Host_FormClosing(object sender, FormClosingEventArgs e)
        {
            Cef.Shutdown();
        }

        private void buttonShowDevToool_Click(object sender, EventArgs e)
        {
            _chromeBrowser.ShowDevTools();   
        }
        private void buttonReload_Click(object sender, EventArgs e)
        {
            _chromeBrowser.Reload(false);
        }

        private void Host_Load(object sender, EventArgs e)
        {
            this.Text = string.Format("{0} {1}", 
                this.Text,
                Interprise.Licensing.Base.Licensing.LicenseManager.Instance.GetProductVersion());
        }       
    }
}
