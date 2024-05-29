# the build context for this Dockerfile is at the root of the repo

# ----- base -----
FROM node:20-alpine as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ----- build -----
FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 1. build dependencies for all workspaces
RUN pnpm run clean
RUN pnpm run build:packages

# 2. build workspace
RUN pnpm --filter=@apps-examples/remix-app build:remix
RUN pnpm --filter=@apps-examples/remix-app build:lambda
# 3. pack workspace with pnpm deploy https://pnpm.io/cli/deploy
RUN pnpm --filter=@apps-examples/remix-app --prod deploy /app/deployed-workspace

# ----- BUILD TARGET: for lambda -----
FROM public.ecr.aws/lambda/nodejs:20 AS lambda
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=build /app/deployed-workspace/ deployed-workspace/
CMD ["deployed-workspace/out/lambda.handler"]

# ----- BUILD TARGET: for local testing  -----
FROM base AS local
WORKDIR /app
COPY --from=build /app/deployed-workspace/ deployed-workspace/
EXPOSE 3000
WORKDIR /app/deployed-workspace
CMD [ "pnpm", "serve" ]
