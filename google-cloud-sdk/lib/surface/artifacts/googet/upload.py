# -*- coding: utf-8 -*- #
# Copyright 2021 Google LLC. All Rights Reserved.
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

"""Implements the command to upload GooGet packages to a repository."""

from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

from apitools.base.py import transfer
from googlecloudsdk.api_lib.util import apis
from googlecloudsdk.api_lib.util import waiter
from googlecloudsdk.calliope import base
from googlecloudsdk.command_lib.artifacts import flags
from googlecloudsdk.core import resources


@base.ReleaseTracks(base.ReleaseTrack.ALPHA)
class Upload(base.Command):
  """Upload a GooGet package to an artifact repository."""

  @staticmethod
  def Args(parser):
    """Set up arguements for this command.

    Args:
      parser: An argparse.ArgumentPaser.
    """
    flags.GetRepoArgFromBeta().AddToParser(parser)
    base.ASYNC_FLAG.AddToParser(parser)

    parser.add_argument(
        '--source',
        metavar='SOURCE',
        required=True,
        help="""\
            The path of a package to upload.""")

  def Run(self, args):
    """Run package import command."""
    client = apis.GetClientInstance('artifactregistry', 'v1')
    messages = client.MESSAGES_MODULE

    client.additional_http_headers['X-Goog-Upload-Protocol'] = 'multipart'

    repo_ref = args.CONCEPTS.repository.Parse()

    request = messages.ArtifactregistryProjectsLocationsRepositoriesGoogetArtifactsUploadRequest(
        parent=repo_ref.RelativeName())

    upload = transfer.Upload.FromFile(args.source, mime_type='application/gzip')

    response = client.projects_locations_repositories_googetArtifacts.Upload(
        request, upload=upload)

    op = response.operation
    op_ref = resources.REGISTRY.ParseRelativeName(
        op.name, collection='artifactregistry.projects.locations.operations')

    if args.async_:
      return op_ref
    else:
      result = waiter.WaitFor(
          waiter.CloudOperationPollerNoResources(
              client.projects_locations_operations),
          op_ref, 'Uploading package')

      return result


Upload.detailed_help = {
    'brief': 'Upload a GooGet package to an artifact repository.',
    'DESCRIPTION': """
      *{command}* uploads a GooGet package to the specified artifact repository.
      """,
    'EXAMPLES': """
      To upload the package `my-package.goo` to `my-repo`, run:

        $ {0} my-repo --location=us-central1 --source={1}
    """.format('{command}', 'my-package.goo')
}
