import svgLibrary from "../../../assets/svgs/svgLibrary.js";
import * as Utils from "../../../utils/utils.js";
export default function renderThemeInfo({
  themeId,
  themeName,
  isLive,
  themeSchema,
  themeSchemaVersion,
  shopURLWithoutDomain,
  windowLocation,
}) {
  const themeSchemaInfo = themeSchema
    ? `${themeSchema}${themeSchemaVersion ? `_v${themeSchemaVersion}` : ""}`
    : "No Data";
  const beaconClass = isLive ? "live-theme-beacon" : "unpublished-theme-beacon";
  const beaconStatusText = isLive ? "Live" : "Draft";

  const themeCodeEditorLink =
    shopURLWithoutDomain && themeId
      ? `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes/${themeId}`
      : "#";
  const previewLink = Utils.buildPreviewLink(windowLocation, themeId);
  const themeEditorLink = Utils.buildThemeEditorLink(
    windowLocation,
    shopURLWithoutDomain,
    themeId
  );

  const renderActionButtons = () => {
    if (!themeId) return "";

    return `
      <div class="theme-action-buttons">
        ${Utils.renderButtonLink(
          svgLibrary.codeEditor,
          "",
          themeCodeEditorLink,
          "theme-code-editor",
          "Theme code editor"
        )}
        ${Utils.renderButtonLink(
          svgLibrary.editor,
          "",
          themeEditorLink,
          "theme-editor",
          "Theme editor"
        )}
      </div>
    `;
  };
  return `<div class="section-content theme-info">
    <div class="beacon-wrapper ${beaconClass}">
      <div class="beacon"></div>
      <div class="beacon-status">${beaconStatusText}</div>
    </div>
    
    <div class="theme-action-wrapper">
      ${renderActionButtons()}
      ${Utils.renderCopyableField(
        "",
        "Preview Link",
        previewLink,
        "preview-link"
      )}
    </div>
    ${Utils.renderCopyableField("", themeName, undefined, "theme-name")}
    
    <hr class="divider"/>
    
    <div class="theme-extra-info">
      ${Utils.renderCopyableField("ID", themeId, undefined, "theme-id")}
      ${Utils.renderCopyableField(
        "Schema",
        themeSchemaInfo,
        undefined,
        "theme-schema"
      )}
    </div>
  </div>`;
}
