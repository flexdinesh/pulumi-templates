# ----- base -----
FROM public.ecr.aws/lambda/nodejs:20 as base
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
RUN pnpm --filter=@apps-examples/hono-rest build:lambda
# 3. pack workspace with pnpm deploy https://pnpm.io/cli/deploy
RUN pnpm --filter=@apps-examples/hono-rest --prod deploy /app/deployed-workspace

# ----- BUILD TARGET: for lambda -----
FROM public.ecr.aws/lambda/nodejs:20 AS lambda
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=build /app/deployed-workspace/ deployed-workspace/
CMD ["deployed-workspace/out/lambda.handler"]
