/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('ARSnova.view.speaker.form.ImageUploadPanel', {
	extend: 'Ext.Panel',

	requires: ['Ext.ux.Fileup',
	           'ARSnova.view.speaker.form.GridModerationTemplateCarousel'],

	config: {
		xtype: 'upField',
		layout: 'vbox',
		
		handlerScope: null,
		urlUploadHandler: Ext.emptyFn,
		fsUploadHandler: Ext.emptyFn,
		toggleUrl: true,
		gridMod: null, 
		templateHandler: Ext.emptyFn
	},

	initialize: function () {
		var thiz = this;
		this.callParent(arguments);
		
		var screenWidth = (window.innerWidth > 0) ?
				window.innerWidth :	screen.width;
		var showShortLabels = screenWidth < 480;
		
		this.gridMod = Ext.create('ARSnova.view.speaker.form.GridModerationTemplateCarousel', {
			saveHandlerScope: thiz,
			templateAdoptionHandler: thiz.adoptTemplate
		});
		
		this.buttonUploadFromFS = Ext.create('Ext.ux.Fileup', {
			//itemId: 'buttonUploadFromFS',
			xtype: 'fileupload',
			autoUpload: true,
			loadAsDataUrl: true,
			states: {
				browse: {
					text: showShortLabels ?
						Messages.SEARCH_PICTURE_SHORT :
						Messages.SEARCH_PICTURE
				},
				ready: {
					text: Messages.LOAD
				},
				uploading: {
					text: Messages.LOADING,
					loading: true
				}
			},
			listeners: {
				scope: this,
				loadsuccess: function (dataurl, e) {
					Ext.bind(this.getFsUploadHandler(), this.getHandlerScope())(dataurl, true);
				},
				loadfailure: function (message) {
					Ext.Msg.alert(Messages.ERROR, Messages.GRID_ERROR_LOADING_IMAGE_FS);
					console.log("Error while loading image: " + message);
				}
			}
		});

		this.buttonUploadFromFS.on({
			loadsuccess: 'onFileLoadSuccess',
			loadfailure: 'onFileLoadFailure'
		});

		this.segmentButton = Ext.create('Ext.SegmentedButton', {
			allowDepress: false,
			cls: 'abcOptions',
			defaults: {
				ui: 'action'
			},
			items: [{
				text: showShortLabels ?
				Messages.SELECT_PICTURE_URL_SHORT :
				Messages.SELECT_PICTURE_URL,
				scope: this,
				handler: Ext.bind(function () {
					var url = this.getComponent('pnl_upfield').getComponent('pnl_url');
					url.setHidden(this.toggleUrl);	
						
					if(this.toggleUrl)
						this.toggleUrl = false;
					else
						this.toggleUrl = true;				
				}, this)
			}, {
				text: Messages.TEMPLATE,
				scope: this,
				handler: function () {
						
					var tabPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;	
					tabPanel.setActiveItem(thiz.gridMod);
				}
			}, 
			this.buttonUploadFromFS]
		});
		
		this.uploadTextfield = Ext.create('Ext.form.Text', {
			label: Messages.SELECT_PICTURE_FS,
			placeHolder: 'http://',
			flex: 3
		});
		
		this.sendButton = Ext.create('Ext.Button', {
			ui: 'action',
			text: Messages.SEND,
			style: {
				'height': '1em',
				'margin-top': '7.5px',
				'margin-left': '10px'
			},
			handler: Ext.bind(function () {
				var url = this.getComponent('pnl_upfield').getComponent('pnl_url').getComponent('tf_url').getValue();							
				Ext.bind(this.getUrlUploadHandler(), this.getHandlerScope())(url);
			}, this)
		});
		
		this.add([{
			xtype: 'fieldset',
			layout: 'hbox',
			cls: 'fileUploadFieldset',
			title: Messages.EDIT_PICTURE,	
			items: [
				this.uploadTextfield,
				this.sendButton
			]
		},  this.segmentButton
		]);
	},

	setUrl: function (url) {
		this.getComponent('pnl_upfield').getComponent('pnl_url').getComponent('tf_url').setValue(url);
	},
	
	adoptTemplate: function(grid) {
		Ext.bind(this.getTemplateHandler(), this.getHandlerScope())(grid);
	},
});
