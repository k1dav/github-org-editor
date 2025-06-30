FROM harbor.apmic.ai/library/node22:latest

# Install tslint, typescript. eslint is installed by javascript image
ARG NODE_MODULES="tslint-to-eslint-config typescript @anthropic-ai/claude-code"
RUN sudo npm install -g ${NODE_MODULES} \
    && sudo npm cache clean --force > /dev/null 2>&1

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
