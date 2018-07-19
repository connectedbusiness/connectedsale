namespace Interprise.Presentation.POS
{
    partial class Host
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Host));
            this.buttonShowDevToool = new System.Windows.Forms.Button();
            this.buttonReload = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // buttonShowDevToool
            // 
            this.buttonShowDevToool.Location = new System.Drawing.Point(14, 15);
            this.buttonShowDevToool.Margin = new System.Windows.Forms.Padding(3, 4, 3, 4);
            this.buttonShowDevToool.Name = "buttonShowDevToool";
            this.buttonShowDevToool.Size = new System.Drawing.Size(63, 28);
            this.buttonShowDevToool.TabIndex = 0;
            this.buttonShowDevToool.Text = "Debug";
            this.buttonShowDevToool.UseVisualStyleBackColor = true;
            this.buttonShowDevToool.Visible = false;
            this.buttonShowDevToool.Click += new System.EventHandler(this.buttonShowDevToool_Click);
            // 
            // buttonReload
            // 
            this.buttonReload.Location = new System.Drawing.Point(83, 15);
            this.buttonReload.Margin = new System.Windows.Forms.Padding(3, 4, 3, 4);
            this.buttonReload.Name = "buttonReload";
            this.buttonReload.Size = new System.Drawing.Size(63, 28);
            this.buttonReload.TabIndex = 1;
            this.buttonReload.Text = "Reload";
            this.buttonReload.UseVisualStyleBackColor = true;
            this.buttonReload.Visible = false;
            this.buttonReload.Click += new System.EventHandler(this.buttonReload_Click);
            // 
            // Host
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.AutoSize = true;
            this.ClientSize = new System.Drawing.Size(1230, 961);
            this.Controls.Add(this.buttonReload);
            this.Controls.Add(this.buttonShowDevToool);
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Margin = new System.Windows.Forms.Padding(3, 4, 3, 4);
            this.Name = "Host";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Connected Sale";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Host_FormClosing);
            this.Load += new System.EventHandler(this.Host_Load);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Button buttonShowDevToool;
        private System.Windows.Forms.Button buttonReload;
    }
}