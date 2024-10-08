# -*- coding: utf-8 -*- #
# Copyright 2019 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Command to create Cloud Firestore Database in Native mode."""

from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

import textwrap

from googlecloudsdk.api_lib.firestore import admin_api
from googlecloudsdk.api_lib.util import apis as core_apis
from googlecloudsdk.calliope import actions
from googlecloudsdk.calliope import base
from googlecloudsdk.command_lib.firestore import create_util
from googlecloudsdk.core import log
from googlecloudsdk.core import properties
from googlecloudsdk.core.log import logging

PRODUCT_NAME = 'Google Cloud Firestore Native'
LOCATION_HELP_TEXT = (
    'The location to create the {product_name} database within. Available '
    'locations are listed at '
    'https://cloud.google.com/firestore/docs/locations.'.format(
        product_name=PRODUCT_NAME
    )
)
FIRESTORE_TO_GAE_REGION = {'nam5': 'us-central', 'eur3': 'europe-west'}
GAE_TO_FIRESTORE_LOCATION = {'us-central': 'nam5', 'europe-west': 'eur3'}


@base.ReleaseTracks(base.ReleaseTrack.ALPHA, base.ReleaseTrack.BETA)
class CreateFirestoreAPI(base.Command):
  """Create a Google Cloud Firestore database via Firestore API.

  ## EXAMPLES

  To create Firestore Native database in nam5.

      $ {command} --location=nam5

  To create Datastore Mode database in us-east1.

      $ {command} --location=us-east1 --type=datastore-mode

  To create Datastore Mode database in us-east1 with a databaseId foo.

      $ {command} --database=mytest --location=us-east1 --type=datastore-mode
  """

  def DatabaseType(self, database_type):
    if database_type == 'firestore-native':
      return (
          admin_api.GetMessages().GoogleFirestoreAdminV1Database.TypeValueValuesEnum.FIRESTORE_NATIVE
      )
    elif database_type == 'datastore-mode':
      return (
          admin_api.GetMessages().GoogleFirestoreAdminV1Database.TypeValueValuesEnum.DATASTORE_MODE
      )
    else:
      raise ValueError('invalid database type: {}'.format(database_type))

  def Run(self, args):
    project = properties.VALUES.core.project.Get(required=True)
    return admin_api.CreateDatabase(
        project, args.location, args.database, self.DatabaseType(args.type)
    )

  @staticmethod
  def Args(parser):
    parser.add_argument(
        '--location',
        help=LOCATION_HELP_TEXT,
        required=True,
        suggestion_aliases=['--region'],
    )
    parser.add_argument(
        '--type',
        help='The type of the database.',
        default='firestore-native',
        choices=['firestore-native', 'datastore-mode'],
    )
    parser.add_argument(
        '--database',
        help="""The ID to use for the database, which will become the final
        component of the database's resource name. If database ID is not
        provided, (default) will be used as database ID.

        This value should be 4-63 characters. Valid characters are /[a-z][0-9]-/
        with first character a letter and the last a letter or a number. Must
        not be UUID-like /[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/.

        Using "(default)" database ID is also allowed.
        """,
        type=str,
        default='(default)',
    )


@base.ReleaseTracks(base.ReleaseTrack.GA)
class Create(base.Command):
  """Create a Google Cloud Firestore Native database."""

  enum_value = core_apis.GetMessagesModule(
      'appengine', 'v1'
  ).Application.DatabaseTypeValueValuesEnum.CLOUD_FIRESTORE
  detailed_help = {
      'DESCRIPTION': """\
          {description}
          """,
      'EXAMPLES': """\
          To create Google Cloud Firestore Native database

              $ {command}

          To create an app in the nam5 region (multi-region), run:

              $ {command} --location=nam5

          To create an app in the us-east1 region,  run:

              $ {command} --location=us-east1
          """,
  }

  def Run(self, args):
    if args.region:
      if args.region in GAE_TO_FIRESTORE_LOCATION:
        logging.warning(
            'Warning: {region} is not a valid Firestore location. '
            'Please use {location} instead.'.format(
                region=args.region,
                location=GAE_TO_FIRESTORE_LOCATION[args.region],
            )
        )

    region = args.region
    if args.location:
      region = args.location

    app_region = FIRESTORE_TO_GAE_REGION.get(region, region)

    create_util.create(app_region, PRODUCT_NAME, self.enum_value)

  def Epilog(self, resources_were_displayed=True):
    message = """firestore database create` will switch to use Firestore API
    after 427.0.0 (see more detail in https://cloud.google.com/firestore/docs/app-engine-requirement#api_requirement).
    Please enable Firestore API before running the command and switch to
    `--location` flag."""
    log.warning(textwrap.dedent(message))

  @staticmethod
  def Args(parser):
    parser.add_argument(
        '--region',
        help=(
            'The region to create the {product_name} database within. '
            'Use `gcloud app regions list` to list available regions.'
        ).format(product_name=PRODUCT_NAME),
        action=actions.DeprecationAction(
            '--region',
            warn=(
                'The `--region` option is deprecated; use `--location` instead.'
            ),
            removed=False,
            action=actions.StoreProperty(properties.VALUES.functions.region),
        ),
    )
    parser.add_argument('--location', help=LOCATION_HELP_TEXT)
