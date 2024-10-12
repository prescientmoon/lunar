{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      rec {
        packages.default = packages.lunar;
        packages.lunar = pkgs.buildNpmPackage {
          name = "lunar";

          buildInputs = [
            pkgs.nodejs
            pkgs.typescript
          ];

          src = pkgs.lib.cleanSource ./.;
          npmDepsHash = "sha256-mu9Jcay66gic6b+UWoPzEOT+FfOWVvMRtq70EvUQeDo=";
        };
      }
    );

  # {{{ Caching and whatnot
  nixConfig = {
    # extra-substituters = [
    #   "erratic-gate.cachix.org-1:Ijiu/v//aVpKO4xBqV+2AM2s2uQYOnGCfoj9fYRXxtk" # I think I need this for neovim-nightly?
    # ];
    #
    # extra-trusted-public-keys = [
    #   "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
    # ];
  };
  # }}}
}
