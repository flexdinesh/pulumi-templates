import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";
import * as mime from "mime";

export class UploadAssets extends pulumi.ComponentResource {
  public readonly files: pulumi.Output<string[]>;
  public readonly objects: pulumi.Output<aws.s3.BucketObject[]>;

  constructor(
    name: string,
    args: {
      publicDirectoryName: string;
      immutableAssetsDirectoryName: string;
      bucket: aws.s3.Bucket;
      files: pulumi.Input<string[]>;
      project: string;
      stack: string;
    },
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("Resource:UploadAssets", name, args, opts);

    this.files = pulumi.output(args.files);

    this.objects = this.files.apply((files) => {
      const objects = Promise.all(
        files.map((file) => {
          // filename includes the directory structure except the top directory "public"
          const objectKey = file.startsWith(`${args.publicDirectoryName}/`)
            ? file.slice(`${args.publicDirectoryName}/`.length)
            : file;
          const isImmutableAssetsDir = file.startsWith(
            `${args.publicDirectoryName}/${args.immutableAssetsDirectoryName}`
          );

          const s3Object = new aws.s3.BucketObject(
            `${args.project}-${args.stack}-asset:${file}`,
            {
              cacheControl: isImmutableAssetsDir
                ? "public, max-age=31536000, immutable"
                : undefined,
              bucket: args.bucket.id,
              source: new pulumi.asset.FileAsset(file),
              contentType: mime.getType(file) || undefined,
              key: objectKey,
            }
          );

          return s3Object;
        })
      );

      // cleanup
      this.objects.apply(() => {
        new command.local.Command("script:delete-public-dir", {
          create: `rm -rf public`,
          dir: ".",
        });
      });

      return objects;
    });

    this.registerOutputs();
  }
}
