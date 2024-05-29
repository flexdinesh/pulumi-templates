import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";
import { getAllFilesInDirectoryRecursively } from "../util/dir";

export class PublicAssets extends pulumi.ComponentResource {
  public readonly files: pulumi.Output<string[]>;
  public readonly script: command.local.Command;

  constructor(
    name: string,
    args: { path: string; image: docker.Image },
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("Resource:PublicAssets", name, args, opts);

    this.script = new command.local.Command(
      "script:copy-files-from-docker-image",
      {
        create: pulumi.interpolate`bash ./src/scripts/copy-files-from-docker-image.sh ${args.image.repoDigest}`,
        dir: ".",
      },
      { dependsOn: [args.image] }
    );

    this.files = this.script.stdout.apply(() => {
      return pulumi.output(
        getAllFilesInDirectoryRecursively({
          dirPath: args.path,
        })
      );
    });

    this.registerOutputs();
  }
}
