/* eslint-disable mediawiki/msg-doc */
/* from https://zh.wikipedia.org/wiki/User:Tranve/public/PreviewWithVariant.js?oldid=65921026 */
// <nowiki>

$.when( mw.loader.using( [ "ext.gadget.site-lib", "ext.gadget.site-lib", "oojs", "oojs-ui", "oojs-ui-core" ] ), $.ready ).done( function () {
	if (
		[ "edit", "submit" ].indexOf( mw.config.get( "wgAction" ) ) === -1 ||
		mw.config.get( "wgPageContentModel" ) !== "wikitext"
	) {
		return;
	}

	window.wgUVS = ( function () {
		var lang = mw.config.get( "wgUserVariant" );
		return function () {
			var args = jQuery.makeArray( arguments );
			args.unshift( lang );
			return window.wgUXS.apply( this, args );
		};
	}() );

	var prefix = "pwv-",
		messages = {
			prefix: wgULS( "以", "以" ),
			"tmplsb-var-label": wgULS( "变体：", "選擇變體：" ),
			"var-zh": wgULS( "不转换", "不轉換" ),
			"var-zh-hans": "简体",
			"var-zh-hant": "繁體",
			"var-zh-cn": "大陆简体",
			"var-zh-hk": "香港繁體",
			"var-zh-mo": "澳門繁體",
			"var-zh-my": "大马简体",
			"var-zh-sg": "新加坡简体",
			"var-zh-tw": "臺灣正體"
		};

	$.each( messages, function ( k, v ) {
		mw.messages.set( prefix + k, v );
	} );

	var VariantTable = [
		{ var: "zh", htmlLang: "zh", msg: "var-zh", skinVarMenuId: "ca-varlang-0" },
		{ var: "zh-hans", htmlLang: "zh-Hans", msg: "var-zh-hans", skinVarMenuId: "ca-varlang-1" },
		{ var: "zh-hant", htmlLang: "zh-Hant", msg: "var-zh-hant", skinVarMenuId: "ca-varlang-2" },
		{ var: "zh-cn", htmlLang: "zh-Hans-CN", msg: "var-zh-cn", skinVarMenuId: "ca-varlang-3" },
		{ var: "zh-hk", htmlLang: "zh-Hant-HK", msg: "var-zh-hk", skinVarMenuId: "ca-varlang-4" },
		{ var: "zh-mo", htmlLang: "zh-Hant-MO", msg: "var-zh-mo", skinVarMenuId: "ca-varlang-5" },
		{ var: "zh-my", htmlLang: "zh-Hans-MY", msg: "var-zh-my", skinVarMenuId: "ca-varlang-6" },
		{ var: "zh-sg", htmlLang: "zh-Hans-SG", msg: "var-zh-sg", skinVarMenuId: "ca-varlang-7" },
		{ var: "zh-tw", htmlLang: "zh-Hant-TW", msg: "var-zh-tw", skinVarMenuId: "ca-varlang-8" }
	];

	function createMenus() {
		var ret = [];

		$.each( VariantTable, function ( _i, item ) {
			ret.push( new OO.ui.MenuOptionWidget( {
				data: item.var,
				label: mw.msg( item.msg )
			} ) );
		} );

		return ret;
	}

	/**
	 * @param {JQuery<HTMLFormElement>} $form
	 * @param {string} variant
	 */
	function applyVariant( $form, variant ) {
		if ( typeof URL === "function" ) {
			var url = new URL( $form.attr( "action" ), window.location.origin );
			url.searchParams.set( "variant", variant );
			$form.attr( "action", url.href );
		} else {
			$form.attr(
				"action",
				new mw.Uri( $form.attr( "action" ) )
					.extend( { variant: variant } )
					.getRelativePath()
			);
		}
	}

	function initUI() {
		var $previewButton, $input, $form, $placeHolder, $tsPage, $tsForm, $tsPreview,
			previewWidget, dropdown, previewField, pageInput, fieldset, tsDropdown, newPreview;

		$previewButton = $( "#wpPreviewWidget" );
		$input = $previewButton.find( "input" );
		$form = $( "#editform" );
		$placeHolder = $( "<span>" ).addClass( "pwv-placeholder" );

		$placeHolder.insertBefore( $previewButton );

		previewWidget = OO.ui.infuse( $previewButton );

		dropdown = new OO.ui.DropdownWidget( {
			$overlay: true,
			menu: {
				items: createMenus()
			}
		} );

		dropdown.getMenu().selectItemByData( mw.config.get( "wgUserVariant" ) );

		previewField = new OO.ui.ActionFieldLayout(
			dropdown,
			previewWidget,
			{ align: "left", id: "pwvPreviewField", label: mw.msg( "pwv-prefix" ) }
		);

		previewField.$element.insertAfter( $placeHolder );

		$placeHolder.detach();

		$input.on( "click", function () {
			applyVariant(
				$form,
				dropdown.getMenu().findSelectedItem().getData()
			);
		} );

		$tsForm = $( ".mw-templatesandbox-fieldset" );

		if ( !$tsForm.length ) {
			return;
		}

		$tsPage = $tsForm.find( "#wpTemplateSandboxPage" );
		$tsPreview = $tsForm.find( "input[name=wpTemplateSandboxPreview]" );
		pageInput = OO.ui.infuse( $tsPage );
		tsDropdown = new OO.ui.DropdownWidget( {
			$overlay: true,
			menu: {
				items: createMenus()
			}
		} );

		tsDropdown.getMenu().selectItemByData( mw.config.get( "wgUserVariant" ) );

		newPreview = new OO.ui.ButtonWidget( {
			label: $tsPreview.attr( "value" ), // "Show preview"
			flags: [
				"progressive"
			]
		} );

		newPreview.on( "click", function () {
			applyVariant(
				$form,
				tsDropdown.getMenu().findSelectedItem().getData()
			);
			$tsPreview.trigger( "click" );
		} );

		fieldset = new OO.ui.FieldsetLayout( {
			// "Preview page with this template"
			label: $tsForm.find( ".oo-ui-labelElement-label" ).text(),
			items: [
				new OO.ui.FieldLayout( pageInput, {
					align: "top"
				} ),
				new OO.ui.FieldLayout( tsDropdown, {
					align: "top",
					label: mw.msg( "pwv-tmplsb-var-label" )
				} ),
				new OO.ui.FieldLayout( newPreview )
			]
		} );

		fieldset.$element.insertAfter( $tsForm );

		$tsForm.css( "display", "none" );
	}

	initUI();
} );

// </nowiki>
