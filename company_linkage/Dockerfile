FROM ubuntu:20.04

# Set up system dependencies
RUN apt -y update
RUN apt-get -y update
RUN apt-get install -y build-essential libssl-dev libffi-dev python3-dev python3-pip curl

# Grab files we need to run
ADD requirements.txt /parat/requirements.txt
ADD parat_scripts/* /parat/

# install gsutil and put it on the path for airflow to use
ENV CLOUDSDK_INSTALL_DIR /usr/local/gcloud/
RUN curl -sSL https://sdk.cloud.google.com | bash
ENV PATH $PATH:/usr/local/gcloud/google-cloud-sdk/bin

# Install python dependencies
WORKDIR /parat
ENV AIRFLOW_GPL_UNIDECODE=yes
RUN pip3 install -r requirements.txt
# Make sure the above config succeeded
RUN python3 -m pytest test_aggregate_organizations.py -k test_add_location