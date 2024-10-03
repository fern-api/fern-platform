# WARNING: Do not use this base image unless it is explicitly required
# we are using this at the time of writing as the generator preview action.
#
# (housed within the github webhook listener) runs checks that require a number of different runtime requirements
# installing go, yarn, python, etc. this image is meant to do all of this pre-install step.
#
# Here we use a node 18 base, as that is what this whole library is written to run as, so this let's us
# use the same functions and logic, etc. as the actual functions (we're just installing more to be able to run `go build`, etc.)
FROM public.ecr.aws/lambda/nodejs:18

RUN yum update

# Install all the cross-lang deps
# Python
RUN yum install -y amazon-linux-extras update-alternatives
RUN amazon-linux-extras install python3.8
RUN yum -y install python3-pip
RUN python3 -m pip install --upgrade --force pip
RUN set -ex; pip install --no-cache-dir poetry;

# TypeScript (as this is a Node base image, npm and Node are already present!)
RUN npm install --global yarn

# Go
RUN yum -y install golang
RUN go version

# Java
RUN yum install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel;
RUN ls /usr/lib/jvm
ENV JAVA_HOME /usr/lib/jvm/java-1.8.0-openjdk/
RUN export JAVA_HOME
RUN java -version

# C#
RUN curl https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
RUN chmod +x ./dotnet-install.sh
RUN ./dotnet-install.sh --channel 8.0

# Ruby
RUN yum install -y ruby
RUN ruby --version

# Any other languages go here...

# Copy all of the functions into the lambda, allowing us to reuse this image if needed
ENV LAMBDA_TASK_ROOT=/var/task
RUN mkdir -p ${LAMBDA_TASK_ROOT}
COPY ./lib/githubWebhookListener.js ${LAMBDA_TASK_ROOT}/githubWebhookListener.js
COPY ./lib/src ${LAMBDA_TASK_ROOT}/src
COPY ./node_modules ${LAMBDA_TASK_ROOT}/node_modules

# Override the Python version at the very end, since yum needs Python 2 defaulted,
# but we need Python 3 defaulted
RUN rm /usr/bin/python
RUN ln -s /usr/bin/python3.8 /usr/bin/python

# To specify the entrypoint, we must specify the `command` option outlined within the docs
# https://www.serverless.com/blog/container-support-for-lambda
# Note we will also need to specify the entry point in config, for example
# command:
# - "src/functions/github-webhook-listenter/githubWebhookListener.handler"
# entryPoint:
# - '/lambda-entrypoint.sh'
