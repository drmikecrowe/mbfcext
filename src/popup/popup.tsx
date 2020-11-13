import "assets/tailwind.scss";
import { m } from "malevic";
import { sync } from "malevic/dom";
import { browser, Button } from "utils";
import { faCog, faAngleDoubleRight } from "utils/elements/font-awesome";
import { InfoHandler } from "./InfoHandler";

function Rated({ bias, biasDescription, mbfcLink }) {
    return (
        <div>
            <h1 class="p-0 pb-2">{bias}</h1>
            <p class="text-sm">{biasDescription}</p>
            <a class="pt-2" href={mbfcLink} rel="noreferrer" target="_blank">
                Read the Media Bias/Fact Check detailed report&nbsp;
                <faAngleDoubleRight />
            </a>
        </div>
    );
}

function Unrated() {
    return (
        <div>
            <h1 class="p-0 pb-2">Not a rated site</h1>
            <p>
                Feel free to view the full list of site rating and bias analysis
                at the
            </p>
            <a
                class="pt-2"
                href="https://mediabiasfactcheck.com"
                rel="noreferrer"
                target="_blank"
            >
                Media Bias/Fact Check Website &nbsp;
                <faAngleDoubleRight />
            </a>
        </div>
    );
}

const main = async () => {
    const popup = InfoHandler.getInstance();
    await popup.updateData();

    const e = document.getElementById("app") as Element;

    sync(
        e,
        <div class="popup">
            <div class="container mx-auto p-2 centered">
                <div class="absolute top-0 right-0">
                    <div class="p-1">
                        <Button
                            handler={() => browser.runtime.openOptionsPage()}
                        >
                            <faCog />
                        </Button>
                    </div>
                </div>

                <div class="clearfix" />
                <div class="pt-3">
                    {popup.rated ? (
                        <Rated
                            bias={popup.bias}
                            biasDescription={popup.biasDescription}
                            mbfcLink={popup.mbfcLink}
                        />
                    ) : (
                        <Unrated />
                    )}
                </div>
            </div>
        </div>
    );
};

main();
