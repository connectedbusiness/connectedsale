using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Security.Permissions;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Drawing.Printing;
using System.Runtime.InteropServices;
using System.Configuration;
using DevExpress.Pdf;

namespace Interprise.Presentation.POS
{
    public class PrinterTool
    {
        public PrinterTool() { }

        public string GetDefaultPrinter()
        {
            return (new PrinterSettings()).PrinterName;
        }

        public string[] GetPrinters()
        {
            return PrinterSettings.InstalledPrinters.Cast<string>().ToArray();
        }

        [System.Security.Permissions.SecurityPermission( SecurityAction.Demand, Flags=SecurityPermissionFlag.AllFlags)]
        public void PrintReport(string pdfUrl, string printer, int copies) 
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(pdfUrl))
                {
                    Task.Run(async () =>
                    {
                        try
                        {
                            using (var httpClient = new HttpClient())
                            {
                                var uri = new Uri(pdfUrl);

                                //Get report pdf
                                var response = await httpClient.GetAsync(uri);
                                response.EnsureSuccessStatusCode();

                                //Get pdf as stream
                                var streamResult = await response.Content.ReadAsStreamAsync();

                                if (streamResult != null)
                                {
                                    using (streamResult)
                                    {
                                        //Silenty print to printer
                                        using (var docServer = new PdfDocumentProcessor())
                                        {
                                            //var reportFileName = Path.GetFileName(uri.LocalPath);
                                            var printerSettings = new PrinterSettings();
                                            if (!string.IsNullOrWhiteSpace(printer)) 
                                                printerSettings.PrinterName = printer;
                                            printerSettings.Copies = (short)(copies <= 0 ? 1 : copies);
                                            
                                            docServer.LoadDocument(streamResult);
                                            docServer.Print(printerSettings);
                                        }
                                    }                                    
                                }
                            }
                        }
                        catch (Exception printEx)
                        {
                            MessageBox.Show(printEx.Message);
                        }                        
                    });                    
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }

        [System.Security.Permissions.SecurityPermission(SecurityAction.Demand, Flags = SecurityPermissionFlag.AllFlags)]
        public bool OpenCashDrawer(string printerName)
        {
            // Get the Drawer Kick Codes from application settings
            string drawerKickCodes = null;
            try 
            {
                drawerKickCodes = Properties.Settings.Default.DrawerKickCodes;
                if (drawerKickCodes == null) { drawerKickCodes = "27,112,0,25,250"; }
            }
            catch
            {
                drawerKickCodes = "27,112,0,25,250";
            }
            
            // Return value (true if successful)
            bool result = false;

            // Convert string into a byte array
            string[] dCodesString = drawerKickCodes.Split(',');
            byte[] dCodeBytes = dCodesString.Select(s => byte.Parse(s)).ToArray();

            // Set up unmanaged call to send the bytes to the printer using marshalling
            IntPtr pUnmanagedBytes = new IntPtr(0);
            pUnmanagedBytes = Marshal.AllocCoTaskMem(dCodeBytes.Length);
            Marshal.Copy(dCodeBytes, 0, pUnmanagedBytes, dCodeBytes.Length);

            // Call the printer helper
            result = RawPrinterHelper.SendBytesToPrinter(printerName, pUnmanagedBytes, dCodeBytes.Length);

            // Release the memory
            Marshal.FreeCoTaskMem(pUnmanagedBytes);

            // Return the result
            return result;
        }

    }

    // This class is "borrowed" from the internet and exposes a static "SendBytesToPrinter" method
    class RawPrinterHelper
    {
        // Structure and API declarions:
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
        public class DOCINFOA
        {
            [MarshalAs(UnmanagedType.LPStr)]
            public string pDocName;
            [MarshalAs(UnmanagedType.LPStr)]
            public string pOutputFile;
            [MarshalAs(UnmanagedType.LPStr)]
            public string pDataType;
        }
        [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);

        [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        public static extern bool ClosePrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        public static extern bool StartDocPrinter(IntPtr hPrinter, Int32 level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);

        [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        public static extern bool EndDocPrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        public static extern bool StartPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        public static extern bool EndPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, Int32 dwCount, out Int32 dwWritten);

        // SendBytesToPrinter()
        // When the function is given a printer name and an unmanaged array
        // of bytes, the function sends those bytes to the print queue.
        // Returns true on success, false on failure.
        public static bool SendBytesToPrinter(string szPrinterName, IntPtr pBytes, Int32 dwCount)
        {
            Int32 dwError = 0, dwWritten = 0;
            IntPtr hPrinter = new IntPtr(0);
            DOCINFOA di = new DOCINFOA();
            bool bSuccess = false; // Assume failure unless you specifically succeed.

            di.pDocName = "My C#.NET RAW Document";
            di.pDataType = "RAW";

            // Open the printer.
            if (OpenPrinter(szPrinterName.Normalize(), out hPrinter, IntPtr.Zero))
            {
                // Start a document.
                if (StartDocPrinter(hPrinter, 1, di))
                {
                    // Start a page.
                    if (StartPagePrinter(hPrinter))
                    {
                        // Write your bytes.
                        bSuccess = WritePrinter(hPrinter, pBytes, dwCount, out dwWritten);
                        EndPagePrinter(hPrinter);
                    }
                    EndDocPrinter(hPrinter);
                }
                ClosePrinter(hPrinter);
            }
            // If you did not succeed, GetLastError may give more information
            // about why not.
            if (bSuccess == false)
            {
                dwError = Marshal.GetLastWin32Error();
            }
            return bSuccess;
        }

    }
}
