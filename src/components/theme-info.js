import svgLibrary from "../assets/svgs/svgLibrary.js";
import * as Utils from "./utils.js";

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
  const previewLink = Utils.buildPreviewLink(windowLocation, themeId);
  const themeEditorLink = Utils.buildThemeEditorLink(
    windowLocation,
    shopURLWithoutDomain,
    themeId
  );
  const themeCodeEditorLink = `https://admin.shopify.com/store/${shopURLWithoutDomain}/themes/${themeId}`;

  //Add live beacon
  return `<div class="section-content theme-info">
    <div class="beacon-wrapper ${
      isLive ? "live-theme-beacon" : "unpublished-theme-beacon"
    }">
      <div class="beacon"></div>
        <div class="beacon-status">${isLive ? "Live" : "Draft"}</div>
    </div>
  ${Utils.renderCopyableField("", themeName, undefined, "theme-name")}
  ${Utils.renderCopyableField("", "Preview Link", previewLink, "preview-link")}
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
  ${Utils.renderButtonLink(
    svgLibrary.themeEdit,
    "",
    themeCodeEditorLink,
    "theme-code-editor"
  )}
  ${Utils.renderButtonLink(
    svgLibrary.themeEditor,
    "",
    themeEditorLink,
    "theme-editor"
  )}
  </div>`;
}
