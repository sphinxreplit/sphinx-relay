{ pkgs }: {
    deps = [
        pkgs.cowsay
    ];
}

nixpkgs.config = {
    allowUnfree = true;
};

 
{ pkgs ? import <nixpkgs> { }
, pkgsLinux ? import <nixpkgs> { system = "x86_64-linux"; }
}:

pkgs.dockerTools.buildImage {
  name = "cowsay-container";
  config = {
    Cmd = [ "${pkgsLinux.cowsay}/bin/cowsay" "I'm a container" ];
  };
}