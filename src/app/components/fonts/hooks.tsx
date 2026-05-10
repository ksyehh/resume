import { useEffect } from "react";
import { Font } from "@react-pdf/renderer";
import { getAllFontFamiliesToLoad } from "components/fonts/lib";

/**
 * Register all fonts to React PDF so it can render fonts correctly in PDF
 */
export const useRegisterReactPDFFont = () => {
  useEffect(() => {
    const allFontFamilies = getAllFontFamiliesToLoad();
    allFontFamilies.forEach((fontFamily) => {
      Font.register({
        family: fontFamily,
        fonts: [
          {
            src: `fonts/${fontFamily}-Regular.ttf`,
          },
          {
            src: `fonts/${fontFamily}-Bold.ttf`,
            fontWeight: "bold",
          },
        ],
      });
    });
  }, []);
};

export const useRegisterReactPDFHyphenationCallback = () => {
  useEffect(() => {
    // React PDF doesn't understand how to wrap non-english word on line break
    // A workaround is to add an empty character after each word
    // Reference https://github.com/diegomura/react-pdf/issues/1568
    Font.registerHyphenationCallback((word) =>
      word
        .split("")
        .map((char) => [char, ""])
        .flat()
    );
  }, []);
};
