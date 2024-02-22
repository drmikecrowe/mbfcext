{ pkgs, ... }: {
  packages = [
    pkgs.cypress
  ];
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_20;
    corepack.enable = true;
  };

  env = {
    "CYPRESS_INSTALL_BINARY" = 0;
    "CYPRESS_RUN_BINARY" = "${pkgs.cypress}/bin/Cypress";
  };
}
